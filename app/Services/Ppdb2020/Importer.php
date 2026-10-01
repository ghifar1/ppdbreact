<?php

namespace App\Services\Ppdb2020;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Enums\StatusPendaftaran;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\Menu;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Services\RegistrationSchedule;
use Carbon\CarbonImmutable;
use DateTimeImmutable;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

/**
 * Copies registrations from a ppdb2020 database into ppdbreact.
 *
 * ppdb2020 kept everything in fixed tables: `users` (login in the `email`
 * column, which can also hold a plain username), one wide `biodatas` row per
 * student (`students` is a copy made when the committee accepted the data),
 * `documents`/`photo_profils` with file names under storage/app/public,
 * `submissions` for the review status and `no_registration_v2_s` (or the
 * older `no_registrations`) for the exam number, the exam (e-learning) login
 * and the selection result. `regist_sessions` holds the registration periods.
 *
 * Everything runs in one transaction: a failure or a dry run leaves the
 * ppdbreact database and storage as they were.
 */
final class Importer
{
    private const CHUNK = 200;

    private ImportReport $report;

    /** @var Collection<string, FormField> field key => field in the target jenjang */
    private Collection $fields;

    /** @var array<string, bool> */
    private array $tables = [];

    /** @var Collection<int, RegistrationPeriod> */
    private Collection $periods;

    /** @var list<string> files written during this run, removed again on rollback */
    private array $written = [];

    /** @var list<string> files replaced during this run, removed after commit */
    private array $replaced = [];

    /**
     * @param  list<string>  $years  only import students registered in these years (empty: all)
     */
    public function __construct(
        private readonly ConnectionInterface $legacy,
        private readonly Jenjang $jenjang,
        private readonly ?string $filesPath = null,
        private readonly array $years = [],
        private readonly bool $admins = false,
        private readonly bool $update = false,
        private readonly bool $dryRun = false,
    ) {
        $this->report = new ImportReport;
        $this->fields = new Collection;
        $this->periods = new Collection;
    }

    public function run(): ImportReport
    {
        foreach (['users', 'biodatas', 'students', 'documents', 'photo_profils', 'submissions', 'no_registration_v2_s', 'no_registrations', 'regist_sessions'] as $table) {
            $this->tables[$table] = $this->legacy->getSchemaBuilder()->hasTable($table);
        }

        if (! $this->tables['users']) {
            throw new RuntimeException('Table "users" not found in the ppdb2020 database. Check the PPDB2020_DB_* settings.');
        }

        foreach (['biodatas', 'submissions', 'documents'] as $table) {
            if (! $this->tables[$table]) {
                $this->report->warn("Table \"{$table}\" not found in the ppdb2020 database; its data is skipped.");
            }
        }

        DB::beginTransaction();

        try {
            $this->prepareFields();
            $this->importPeriods();
            $this->legacy->table('users')->chunkById(self::CHUNK, fn (Collection $rows) => $this->importChunk($rows));
        } catch (Throwable $e) {
            DB::rollBack();
            Storage::disk('local')->delete($this->written);

            throw $e;
        }

        if ($this->dryRun) {
            DB::rollBack();
            Storage::disk('local')->delete($this->written);
        } else {
            DB::commit();
            Storage::disk('local')->delete($this->replaced);
        }

        return $this->report;
    }

    /**
     * Make sure every ppdb2020 field has a place in the target jenjang.
     */
    private function prepareFields(): void
    {
        $menus = Menu::forJenjang($this->jenjang)->ordered()->with('fields')->get();

        $this->fields = $menus->flatMap(fn (Menu $menu) => $menu->fields)
            ->filter(fn (FormField $field) => $field->key !== null)
            ->keyBy('key');

        $requiredAdded = false;

        foreach (Catalog::menus() as $definition) {
            $missing = array_filter($definition['fields'], fn (array $field) => ! $this->fields->has($field['key']));

            if (! $missing) {
                continue;
            }

            $menu = $this->findMenu($menus, $definition['title']) ?? $this->createMenu($definition, $menus);
            $order = (int) $menu->fields()->max('sort_order');

            foreach ($missing as $attributes) {
                $field = $menu->fields()->create($attributes + ['sort_order' => ++$order]);
                $this->fields->put($field->key, $field);
                $this->report->fieldsCreated[] = "{$menu->title} › {$field->label}";
                $requiredAdded = $requiredAdded || $field->is_required;
            }
        }

        if ($requiredAdded) {
            $editing = User::where('role', User::ROLE_STUDENT)
                ->where('jenjang', $this->jenjang)
                ->whereNull('legacy_id')
                ->whereIn('status', [StatusPendaftaran::PengisianData, StatusPendaftaran::PerluPerbaikan])
                ->count();

            if ($editing > 0) {
                $this->report->warn("{$editing} {$this->jenjang->shortLabel()} students still filling in their forms now have new required fields. Change them under Menu & Formulir if that is not wanted.");
            }
        }
    }

    private function findMenu(Collection $menus, string $title): ?Menu
    {
        return $menus->first(fn (Menu $menu) => Str::lower($menu->title) === Str::lower($title));
    }

    /**
     * @param  array{title: string, description: string, after: ?string}  $definition
     */
    private function createMenu(array $definition, Collection $menus): Menu
    {
        $after = $definition['after'] ? $this->findMenu($menus, $definition['after']) : null;
        $position = match (true) {
            $after !== null => $after->sort_order + 1,
            $definition['after'] === null => 1,
            default => (int) $menus->max('sort_order') + 1,
        };

        Menu::forJenjang($this->jenjang)->where('sort_order', '>=', $position)->increment('sort_order');
        $menus->each(function (Menu $menu) use ($position) {
            if ($menu->sort_order >= $position) {
                $menu->sort_order++;
                $menu->syncOriginalAttribute('sort_order');
            }
        });

        $menu = Menu::create([
            'jenjang' => $this->jenjang,
            'title' => $definition['title'],
            'description' => $definition['description'],
            'sort_order' => $position,
            'is_active' => true,
        ]);

        $menus->push($menu->setRelation('fields', new Collection));
        $this->report->menusCreated[] = $menu->title;

        return $menu;
    }

    /**
     * ppdb2020's registration waves become registration periods of the target
     * jenjang, so imported students can be linked to the wave they joined.
     */
    private function importPeriods(): void
    {
        if (! $this->tables['regist_sessions']) {
            return;
        }

        foreach ($this->legacy->table('regist_sessions')->orderBy('open')->get() as $row) {
            $opens = $this->timestamp(data_get($row, 'open'));
            $closes = $this->timestamp(data_get($row, 'close'));

            if ($opens === null || $closes === null) {
                $this->report->warn("Registration period \"{$row->regist_name}\" has no open/close time; skipped.");

                continue;
            }

            $name = trim((string) data_get($row, 'regist_name')) ?: 'Gelombang';
            $year = trim((string) data_get($row, 'year'));
            if ($year !== '' && ! str_contains($name, $year)) {
                $name .= " {$year}";
            }

            $period = RegistrationPeriod::firstOrCreate(
                ['jenjang' => $this->jenjang, 'opens_at' => $opens, 'closes_at' => $closes],
                ['name' => Str::limit($name, 100, '')],
            );

            if ($period->wasRecentlyCreated) {
                $this->report->periodsCreated[] = "{$period->name} ({$period->present()['range_label']})";
            }

            $this->periods->push($period);
        }

        if ($this->report->periodsCreated && ! (new RegistrationSchedule)->for($this->jenjang)['open']) {
            $this->report->warn("Registration for {$this->jenjang->label()} is now closed because none of its periods is open. Add a new period under Gelombang Pendaftaran to open it.");
        }
    }

    private function periodFor(?string $registeredAt): ?RegistrationPeriod
    {
        if ($registeredAt === null) {
            return null;
        }

        $at = CarbonImmutable::parse($registeredAt);

        return $this->periods->first(fn (RegistrationPeriod $period) => $at->betweenIncluded($period->opens_at, $period->closes_at));
    }

    /**
     * @param  Collection<int, object>  $rows
     */
    private function importChunk(Collection $rows): void
    {
        $ids = $rows->pluck('id')->all();

        $related = [
            'biodatas' => $this->latestPerUser('biodatas', $ids),
            'students' => $this->latestPerUser('students', $ids),
            'submissions' => $this->latestPerUser('submissions', $ids),
            'noreg' => $this->latestPerUser('no_registration_v2_s', $ids),
            'noregV1' => $this->latestPerUser('no_registrations', $ids),
            'photos' => $this->latestPerUser('photo_profils', $ids),
            'documents' => $this->tables['documents']
                ? $this->legacy->table('documents')->whereIn('user_id', $ids)->orderBy('id')->get()->groupBy('user_id')
                : new Collection,
        ];

        foreach ($rows as $row) {
            $this->importUser($row, $related);
        }
    }

    /**
     * @param  list<int>  $ids
     * @return Collection<int, object> keyed by user_id, newest row wins
     */
    private function latestPerUser(string $table, array $ids): Collection
    {
        if (! $this->tables[$table]) {
            return new Collection;
        }

        return $this->legacy->table($table)->whereIn('user_id', $ids)->orderBy('id')->get()->keyBy('user_id');
    }

    /**
     * @param  array<string, Collection>  $related
     */
    private function importUser(object $row, array $related): void
    {
        $isAdmin = in_array(Str::lower((string) data_get($row, 'apakah_admin')), ['1', 'true'], true);

        if ($isAdmin && ! $this->admins) {
            $this->report->skippedAdmins++;

            return;
        }

        if (! $isAdmin) {
            $year = $this->legacyYear($row);
            $this->report->years[$year] = ($this->report->years[$year] ?? 0) + 1;

            if ($this->years && ! in_array($year, $this->years, true)) {
                $this->report->skippedYear++;

                return;
            }
        }

        $login = Str::lower(trim((string) data_get($row, 'email')));

        if ($login === '') {
            $this->report->conflicts[] = ['legacy_id' => (int) $row->id, 'login' => '', 'reason' => 'Account has no email/username.'];

            return;
        }

        $user = User::where('legacy_id', $row->id)->first();

        if ($user && ! $this->update) {
            $this->report->skippedExisting++;

            return;
        }

        $data = $related['biodatas']->get($row->id) ?? $related['students']->get($row->id);
        $isNew = $user === null;

        if ($isNew) {
            $user = $this->newAccount($row, $login, $isAdmin);

            if ($user === null) {
                return;
            }
        }

        $name = trim((string) data_get($row, 'name')) ?: trim((string) data_get($data, 'nama')) ?: $login;
        $user->forceFill([
            'name' => Str::limit($name, 255, ''),
            'role' => $isAdmin ? User::ROLE_ADMIN : User::ROLE_STUDENT,
            'jenjang' => $isAdmin ? null : $this->jenjang,
            'no_hp' => $this->phone(data_get($row, 'nohp')),
            'created_at' => $this->timestamp(data_get($row, 'created_at')) ?? now(),
            'updated_at' => $this->timestamp(data_get($row, 'updated_at')) ?? now(),
        ]);

        if (! $isAdmin) {
            $noreg = $related['noreg']->get($row->id) ?? $related['noregV1']->get($row->id);
            $this->applyStatus($user, $related['submissions']->get($row->id), $noreg, $row);
            $this->applyExamAccount($user, $noreg);
            $user->registration_period_id = $this->periodFor($this->timestamp(data_get($row, 'created_at')))?->id;
        }

        $user->save();

        $isNew ? $this->report->created++ : $this->report->updated++;

        if ($isAdmin) {
            return;
        }

        $this->report->statuses[$user->status->value] = ($this->report->statuses[$user->status->value] ?? 0) + 1;
        // ppdb2020 only made accounts after the registration fee was checked.
        $user->payment()->firstOrCreate([], [
            'jenjang' => $this->jenjang,
            'method' => Payment::METHOD_IMPORT,
            'status' => PaymentStatus::Diterima,
            'note' => 'Akun ppdb2020: dibuat setelah pembayaran diperiksa.',
            'submitted_at' => $user->created_at,
            'reviewed_at' => $user->created_at,
        ]);
        $this->importAnswers($user, $data);
        $this->importFiles($user, $row, $related);
    }

    /**
     * An unsaved user with login and password carried over, or null when the
     * account cannot be imported.
     */
    private function newAccount(object $row, string $login, bool $isAdmin): ?User
    {
        $isEmail = filter_var($login, FILTER_VALIDATE_EMAIL) !== false;

        if ($isEmail && User::where('email', $login)->exists()) {
            $this->report->conflicts[] = [
                'legacy_id' => (int) $row->id,
                'login' => $login,
                'reason' => 'Email already belongs to another ppdbreact account.',
            ];

            return null;
        }

        $username = $this->username($login, $isEmail);
        $hash = (string) data_get($row, 'password');
        $passwordKept = (password_get_info($hash)['algoName'] ?? null) === 'bcrypt';

        $user = new User;
        $user->forceFill([
            'username' => $username,
            'email' => $isEmail ? $login : null,
            'legacy_id' => $row->id,
        ]);

        // Keep the bcrypt hash as-is; the "hashed" cast would reject or re-hash it.
        $attributes = $user->getAttributes();
        $attributes['password'] = $passwordKept ? $hash : Hash::make(Str::random(40));
        $user->setRawAttributes($attributes);

        $how = $isEmail ? 'email lama' : "username \"{$username}\"";
        $note = match (true) {
            ! $passwordKept => "Akun Google tanpa password: atur ulang password di Data Siswa, lalu siswa masuk dengan {$how}.",
            ! $isEmail && $username !== $login => "Username berubah dari \"{$login}\" menjadi \"{$username}\"; password tetap sama.",
            default => "Masuk dengan {$how} dan password lama.",
        };

        $this->report->accounts[] = [
            'id_ppdb2020' => (string) $row->id,
            'nama' => (string) data_get($row, 'name'),
            'peran' => $isAdmin ? 'admin' : 'siswa',
            'login_lama' => $login,
            'username_baru' => $username,
            'email' => $isEmail ? $login : '',
            'catatan' => $note,
        ];

        return $user;
    }

    /**
     * Plain usernames are kept when possible so students can log in as before;
     * email logins get a username derived from the part before the "@".
     */
    private function username(string $login, bool $isEmail): string
    {
        if (! $isEmail && strlen($login) <= 30 && ! User::where('username', $login)->exists()) {
            return $login;
        }

        $base = Str::of(Str::ascii($isEmail ? Str::before($login, '@') : $login))
            ->lower()
            ->replaceMatches('/[^a-z0-9_-]+/', '_')
            ->trim('_-')
            ->limit(24, '')
            ->value();
        $base = strlen($base) >= 4 ? $base : 'siswa'.$base;

        $username = $base;
        for ($i = 2; User::where('username', $username)->exists(); $i++) {
            $username = "{$base}_{$i}";
        }

        return $username;
    }

    private function applyStatus(User $user, ?object $submission, ?object $noreg, object $row): void
    {
        $result = Str::lower((string) data_get($noreg, 'is_lulus'));
        $review = Str::lower((string) data_get($submission, 'status'));

        $status = match (true) {
            $result === 'lulus' => StatusPendaftaran::Lulus,
            $result === 'gagal' => StatusPendaftaran::TidakLulus,
            $review === 'success' => StatusPendaftaran::Terverifikasi,
            $review === 'waiting' => StatusPendaftaran::MenungguVerifikasi,
            $review === 'failed' => StatusPendaftaran::PerluPerbaikan,
            default => StatusPendaftaran::PengisianData,
        };

        $comment = trim((string) data_get($submission, 'comment'));
        $submittedAt = $submission
            ? $this->timestamp(data_get($submission, $review === 'waiting' ? 'updated_at' : 'created_at')) ?? now()
            : null;

        $number = data_get($noreg, 'no_registration');
        $year = data_get($noreg, 'tahun') ?: $this->legacyYear($row);

        $user->forceFill([
            'status' => $status,
            'catatan_admin' => $comment !== '' ? $comment : null,
            'finalized_at' => $status === StatusPendaftaran::PengisianData ? null : $submittedAt,
            'nomor_pendaftaran' => is_numeric($number)
                ? sprintf('%s-%s-%03d', strtoupper($this->jenjang->value), $year, (int) $number)
                : null,
        ]);

        // The old exam number is also the participant number exam sessions are split by.
        if (is_numeric($number) && (int) $number > 0 && $user->exam_number === null) {
            $taken = User::where('jenjang', $this->jenjang)->where('exam_year', (int) $year)->where('exam_number', (int) $number)
                ->when($user->exists, fn ($query) => $query->whereKeyNot($user->id))
                ->exists();

            $taken
                ? $this->report->warn("{$user->name}: participant number {$number} ({$year}) is already used; a new one is given when the exam card is opened.")
                : $user->forceFill(['exam_number' => (int) $number, 'exam_year' => (int) $year]);
        }
    }

    /**
     * The e-learning login ppdb2020 printed on the exam card (NISN and the
     * registration code). Accounts already set in ppdbreact are kept.
     */
    private function applyExamAccount(User $user, ?object $noreg): void
    {
        $username = trim((string) data_get($noreg, 'username_ujian'));
        $password = trim((string) data_get($noreg, 'password_ujian'));

        if ($user->exam_username !== null || $username === '' || $password === '') {
            return;
        }

        $taken = User::where('exam_username', $username)
            ->when($user->exists, fn ($query) => $query->whereKeyNot($user->id))
            ->exists();

        if ($taken) {
            $this->report->warn("{$user->name}: exam username \"{$username}\" is already used by another student; a new one is made when the exam card is opened.");

            return;
        }

        $user->forceFill(['exam_username' => Str::limit($username, 50, ''), 'exam_password' => $password]);
        $this->report->examAccounts++;
    }

    private function importAnswers(User $user, ?object $data): void
    {
        if ($data === null) {
            return;
        }

        $rows = [];

        foreach (Catalog::dataKeys() as $key) {
            $raw = trim((string) data_get($data, $key));
            $field = $this->fields->get($key);

            if ($raw === '' || $field === null) {
                continue;
            }

            $value = $this->convert($field, $raw, $user);

            if ($value !== null) {
                $rows[] = ['user_id' => $user->id, 'form_field_id' => $field->id, 'value' => $value];
            }
        }

        if ($rows) {
            FormAnswer::upsert($rows, ['user_id', 'form_field_id'], ['value']);
            $this->report->answers += count($rows);
        }
    }

    /**
     * Turn a ppdb2020 value into what the field type expects. Values that do
     * not fit are kept as they are and reported, never dropped.
     */
    private function convert(FormField $field, string $raw, User $user): ?string
    {
        switch ($field->type) {
            case FieldType::Number:
                $number = str_replace(',', '.', $raw);
                if (is_numeric($number)) {
                    return $number;
                }
                if (preg_match('/^(-?\d+(?:[.,]\d+)?)\s*[a-z.%]*$/i', $raw, $match)) {
                    return str_replace(',', '.', $match[1]);
                }
                $this->report->warn("{$user->name}: \"{$field->label}\" is \"{$raw}\", not a number; kept as is.");

                return $raw;

            case FieldType::Date:
                $date = $this->parseDate($raw);
                if ($date === null) {
                    $this->report->warn("{$user->name}: \"{$field->label}\" is \"{$raw}\", not a date; kept as is.");
                }

                return $date ?? $raw;

            case FieldType::Select:
            case FieldType::Radio:
                return $this->option($field, $raw);

            case FieldType::Checkbox:
                return json_encode([$this->option($field, $raw)]);

            case FieldType::File:
                $this->report->warn("{$user->name}: \"{$field->label}\" is now a file upload; old value \"{$raw}\" skipped.");

                return null;

            default:
                return $raw;
        }
    }

    /**
     * The matching option (ignoring case and spacing), or the raw value after
     * adding it to the field's options so it stays valid.
     */
    private function option(FormField $field, string $raw): string
    {
        $options = $field->options ?? [];
        $normalize = fn (string $value) => Str::lower(preg_replace('/\s+/', ' ', trim($value)));

        foreach ($options as $option) {
            if ($normalize($option) === $normalize($raw)) {
                return $option;
            }
        }

        $field->options = [...$options, $raw];
        $field->save();
        $this->report->optionAdded($field->label, $raw);

        return $raw;
    }

    /**
     * ppdb2020 stored birth dates as typed through a dd/mm/yyyy input mask.
     */
    private function parseDate(string $raw): ?string
    {
        foreach (['!d/m/Y', '!d-m-Y', '!Y-m-d', '!d.m.Y', '!Y/m/d'] as $format) {
            $date = DateTimeImmutable::createFromFormat($format, $raw);
            $errors = DateTimeImmutable::getLastErrors();

            if ($date && ($errors === false || ($errors['warning_count'] === 0 && $errors['error_count'] === 0))
                && $date->format('Y') >= 1900 && $date->format('Y') <= 2100) {
                return $date->format('Y-m-d');
            }
        }

        return null;
    }

    /**
     * @param  array<string, Collection>  $related
     */
    private function importFiles(User $user, object $row, array $related): void
    {
        $sources = [];

        if ($photo = $related['photos']->get($row->id)) {
            $sources['foto'] = $photo->link;
        }

        foreach ($related['documents']->get($row->id, []) as $document) {
            $type = Str::lower((string) $document->type);

            if (! isset(Catalog::DOCUMENT_FOLDERS[$type])) {
                $this->report->warn("{$user->name}: unknown document type \"{$document->type}\" skipped.");

                continue;
            }

            $sources[$type] = $document->link; // newest upload wins
        }

        foreach ($sources as $key => $link) {
            $field = $this->fields->get($key);
            $name = basename((string) $link);

            if ($field === null || $field->type !== FieldType::File || $name === '') {
                continue;
            }

            if ($this->filesPath === null) {
                $this->report->filesSkipped++;

                continue;
            }

            $source = $this->filesPath.DIRECTORY_SEPARATOR.Catalog::DOCUMENT_FOLDERS[$key].DIRECTORY_SEPARATOR.$name;

            if (! is_file($source)) {
                $this->report->filesMissing++;
                $this->report->warn("{$user->name}: file for \"{$field->label}\" not found ({$source}).");

                continue;
            }

            $existing = FormAnswer::where('user_id', $user->id)->where('form_field_id', $field->id)->first();
            $current = $existing ? json_decode((string) $existing->value, true) : null;

            if (is_array($current) && ($current['name'] ?? null) === $name) {
                continue; // imported on an earlier run
            }

            if ($this->dryRun) {
                $this->report->filesCopied++;

                continue;
            }

            $extension = Str::lower(pathinfo($name, PATHINFO_EXTENSION));
            $path = "ppdb/{$user->id}/".Str::random(40).($extension !== '' ? ".{$extension}" : '');
            $stream = fopen($source, 'rb');
            Storage::disk('local')->writeStream($path, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
            $this->written[] = $path;

            if (is_array($current) && ! empty($current['path'])) {
                $this->replaced[] = $current['path'];
            }

            FormAnswer::updateOrCreate(
                ['user_id' => $user->id, 'form_field_id' => $field->id],
                ['value' => json_encode(['path' => $path, 'name' => $name])],
            );
            $this->report->filesCopied++;

            // ppdb2020 showed this photo as the profile photo, so it becomes ours too.
            if ($key === 'foto' && $user->photo_path === null) {
                $photo = "ppdb/{$user->id}/foto/".basename($path);
                Storage::disk('local')->copy($path, $photo);
                $this->written[] = $photo;
                $user->forceFill(['photo_path' => $photo])->save();
            }
        }
    }

    /**
     * MySQL zero dates ("0000-00-00 ...") count as missing.
     */
    private function timestamp(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' || str_starts_with($value, '0000') ? null : $value;
    }

    private function legacyYear(object $row): string
    {
        $year = trim((string) data_get($row, 'year'));

        if ($year !== '') {
            return $year;
        }

        $created = $this->timestamp(data_get($row, 'created_at'));

        return $created !== null ? substr($created, 0, 4) : 'tanpa tahun';
    }

    /**
     * ppdb2020 stored numbers without the leading zero ("81234...").
     */
    private function phone(mixed $value): ?string
    {
        $phone = preg_replace('/\s+/', '', (string) $value);

        if ($phone === '') {
            return null;
        }

        return Str::limit(str_starts_with($phone, '8') ? "0{$phone}" : $phone, 30, '');
    }
}
