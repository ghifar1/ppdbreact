<?php

namespace Tests\Feature;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\Menu;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Concerns\Ppdb2020Database;
use Tests\TestCase;

class Ppdb2020ImportTest extends TestCase
{
    use Ppdb2020Database, RefreshDatabase;

    private string $files;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        $this->seed(MenuSeeder::class);
        $this->createPpdb2020Database();
        $this->files = sys_get_temp_dir().'/ppdb2020-'.uniqid();
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->files);

        parent::tearDown();
    }

    private function answer(User $user, string $key): ?string
    {
        $field = FormField::where('key', $key)
            ->whereHas('menu', fn ($query) => $query->where('jenjang', $user->jenjang))
            ->firstOrFail();

        return FormAnswer::where('user_id', $user->id)->where('form_field_id', $field->id)->value('value');
    }

    private function maField(string $key): FormField
    {
        return FormField::where('key', $key)
            ->whereHas('menu', fn ($query) => $query->where('jenjang', Jenjang::MA))
            ->firstOrFail();
    }

    public function test_student_is_imported_with_account_answers_and_result(): void
    {
        $id = $this->legacyUser(biodata: [
            'nisn' => '0081234567',
            'nik' => '3201234567890001',
            'nama' => 'SITI AMINAH',
            'jenis_kelamin' => 'Perempuan',
            'tanggal_lahir' => '17/05/2008',
            'agama' => 'islam',
            'tinggi_badan' => '155 cm',
            'nama_ayah' => 'AHMAD',
            'pekerjaan_ayah' => 'Petani/Peternak',
            'nama_sekolah' => 'MTS NURUL HUDA',
            'status_siswa' => 'SISWA BARU TINGKAT 10',
        ]);
        $this->legacySubmission($id, 'success');
        $this->legacyResult($id, 7, 'lulus');

        $this->artisan('ppdb:import-2020')->assertSuccessful();

        $user = User::where('legacy_id', $id)->firstOrFail();
        $this->assertSame('siti', $user->username);
        $this->assertSame('siti@example.com', $user->email);
        $this->assertSame('Siti Aminah', $user->name);
        $this->assertSame(Jenjang::MA, $user->jenjang);
        $this->assertSame('lulus', $user->status->value);
        $this->assertSame('MA-2024-007', $user->nomorPendaftaran());
        $this->assertSame('007', $user->nomorPeserta());
        $this->assertSame(2024, $user->exam_year);
        // ppdb2020 only made accounts after the fee was checked.
        $this->assertSame(PaymentStatus::Diterima, $user->payment->status);
        $this->assertSame(Payment::METHOD_IMPORT, $user->payment->method);
        $this->assertSame('081234567890', $user->no_hp);
        $this->assertSame('2024-03-01', $user->created_at->toDateString());
        $this->assertNotNull($user->finalized_at);
        $this->assertFalse($user->isAdmin());

        // Seeded fields are reused, missing ones are created.
        $this->assertSame('SITI AMINAH', $this->answer($user, 'nama'));
        $this->assertSame('3201234567890001', $this->answer($user, 'nik'));
        $this->assertSame('0081234567', $this->answer($user, 'nisn'));
        $this->assertSame('2008-05-17', $this->answer($user, 'tanggal_lahir'));
        $this->assertSame('Islam', $this->answer($user, 'agama'));
        $this->assertSame('155', $this->answer($user, 'tinggi_badan'));
        $this->assertSame('Petani/Peternak', $this->answer($user, 'pekerjaan_ayah'));
        $this->assertSame('MTS NURUL HUDA', $this->answer($user, 'nama_sekolah'));
        $this->assertSame(1, FormField::where('key', 'nik')->whereHas('menu', fn ($q) => $q->where('jenjang', 'ma'))->count());

        // Old passwords keep working, with the email or the new username.
        $this->post('/login', ['username' => 'siti@example.com', 'password' => 'KODE123456'])->assertRedirect('/dashboard');
        $this->post('/logout');
        $this->post('/login', ['username' => 'siti', 'password' => 'KODE123456'])->assertRedirect('/dashboard');
    }

    public function test_menus_match_the_old_forms(): void
    {
        $this->artisan('ppdb:import-2020')->assertSuccessful();

        $titles = Menu::forJenjang(Jenjang::MA)->ordered()->pluck('title')->all();
        $this->assertSame(['Data Pribadi', 'Data Orang Tua', 'Data Wali', 'Data Sekolah', 'Prestasi', 'Dokumen'], $titles);

        $this->assertSame(FieldType::File, $this->maField('kk')->type);
        $this->assertTrue($this->maField('kk')->is_required);
        $this->assertSame(FieldType::Select, $this->maField('agama')->type);
        // Other jenjang are left alone.
        $this->assertSame(4, Menu::forJenjang(Jenjang::MTs)->count());
    }

    public static function statuses(): array
    {
        return [
            'still filling in' => [null, null, 'pengisian_data'],
            'submitted' => ['waiting', null, 'menunggu_verifikasi'],
            'sent back' => ['failed', null, 'perlu_perbaikan'],
            'accepted' => ['success', 'waiting', 'terverifikasi'],
            'failed selection' => ['success', 'gagal', 'tidak_lulus'],
        ];
    }

    #[DataProvider('statuses')]
    public function test_review_status_is_mapped(?string $submission, ?string $result, string $expected): void
    {
        $id = $this->legacyUser();
        if ($submission) {
            $this->legacySubmission($id, $submission, $submission === 'failed' ? 'Foto KK buram.' : null);
        }
        if ($result) {
            $this->legacyResult($id, 12, $result);
        }

        $this->artisan('ppdb:import-2020')->assertSuccessful();

        $user = User::where('legacy_id', $id)->firstOrFail();
        $this->assertSame($expected, $user->status->value);
        $this->assertSame($submission === 'failed' ? 'Foto KK buram.' : null, $user->catatan_admin);
        $this->assertSame($submission === null, $user->finalized_at === null);
        $this->assertSame($result ? 'MA-2024-012' : sprintf('MA-2024-%05d', $user->id), $user->nomorPendaftaran());
    }

    public function test_documents_and_photo_are_copied_into_private_storage(): void
    {
        File::ensureDirectoryExists("{$this->files}/documents");
        File::ensureDirectoryExists("{$this->files}/profils");
        File::put("{$this->files}/documents/Siti_kk_1.jpg", 'old kk');
        File::put("{$this->files}/documents/Siti_kk_2.jpg", 'new kk');
        File::put("{$this->files}/profils/abc123.png", 'photo');

        $id = $this->legacyUser();
        DB::connection('ppdb2020')->table('documents')->insert([
            ['type' => 'kk', 'link' => 'Siti_kk_1.jpg', 'user_id' => $id],
            ['type' => 'kk', 'link' => 'Siti_kk_2.jpg', 'user_id' => $id],
            ['type' => 'akte', 'link' => 'Siti_akte_1.jpg', 'user_id' => $id],
        ]);
        DB::connection('ppdb2020')->table('photo_profils')->insert(['user_id' => $id, 'link' => 'abc123.png']);

        $this->artisan('ppdb:import-2020', ['--files' => $this->files])
            ->expectsOutputToContain('Siti_akte_1.jpg')
            ->assertSuccessful();

        $user = User::where('legacy_id', $id)->firstOrFail();

        $kk = json_decode($this->answer($user, 'kk'), true);
        $this->assertSame('Siti_kk_2.jpg', $kk['name']);
        $this->assertStringStartsWith("ppdb/{$user->id}/", $kk['path']);
        $this->assertSame('new kk', Storage::disk('local')->get($kk['path']));

        $photo = json_decode($this->answer($user, 'foto'), true);
        $this->assertSame('photo', Storage::disk('local')->get($photo['path']));

        $this->assertNull($this->answer($user, 'akte'));

        // The student can open their own imported file.
        $this->actingAs($user)
            ->get(route('answers.file', FormAnswer::where('user_id', $user->id)->where('form_field_id', $this->maField('kk')->id)->first()))
            ->assertOk();
    }

    public function test_running_again_skips_imported_students_and_update_refreshes_them(): void
    {
        $id = $this->legacyUser(biodata: ['nama' => 'SITI']);
        $this->legacySubmission($id, 'waiting');

        $this->artisan('ppdb:import-2020')->assertSuccessful();
        $user = User::where('legacy_id', $id)->firstOrFail();
        $user->forceFill(['password' => 'password-baru'])->save();

        $this->artisan('ppdb:import-2020')->assertSuccessful();
        $this->assertSame(1, User::where('legacy_id', $id)->count());

        DB::connection('ppdb2020')->table('submissions')->where('user_id', $id)->update(['status' => 'success']);
        DB::connection('ppdb2020')->table('biodatas')->where('user_id', $id)->update(['nama' => 'SITI AMINAH']);

        $this->artisan('ppdb:import-2020', ['--update' => true])->assertSuccessful();

        $user->refresh();
        $this->assertSame('terverifikasi', $user->status->value);
        $this->assertSame('SITI AMINAH', $this->answer($user, 'nama'));
        $this->assertTrue(Hash::check('password-baru', $user->password), '--update must not reset credentials');
    }

    public function test_dry_run_saves_nothing(): void
    {
        $this->legacyUser(biodata: ['nama' => 'SITI', 'agama' => 'Islam']);
        $counts = fn () => [User::count(), Menu::count(), FormField::count(), FormAnswer::count()];
        $before = $counts();

        $this->artisan('ppdb:import-2020', ['--dry-run' => true])
            ->expectsOutputToContain('Dry run finished')
            ->assertSuccessful();

        $this->assertSame($before, $counts());
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_usernames_google_accounts_and_conflicts(): void
    {
        User::factory()->create(['username' => 'budisantoso']);
        User::factory()->create(['username' => 'rina', 'email' => 'rina@example.com']);

        $plain = $this->legacyUser(['name' => 'Ani', 'email' => 'ani.lestari']);
        $taken = $this->legacyUser(['name' => 'Budi Santoso', 'email' => 'budisantoso']);
        $google = $this->legacyUser([
            'name' => 'Dewi', 'email' => 'dewi@gmail.com', 'google_id' => '1234',
            'password' => 'eyJpdiI6IkZha2UiLCJ2YWx1ZSI6IkZha2UifQ==', 'is_verified' => 'false',
        ]);
        $conflict = $this->legacyUser(['name' => 'Rina', 'email' => 'rina@example.com']);

        $this->artisan('ppdb:import-2020')
            ->expectsOutputToContain('Email already belongs to another ppdbreact account')
            ->assertSuccessful();

        // A plain login is kept exactly, so the old username still works.
        $this->assertSame('ani.lestari', User::where('legacy_id', $plain)->value('username'));
        $this->post('/login', ['username' => 'ani.lestari', 'password' => 'KODE123456'])->assertRedirect('/dashboard');
        $this->post('/logout');

        $this->assertSame('budisantoso_2', User::where('legacy_id', $taken)->value('username'));

        // Google accounts had no usable password; they get an unguessable one.
        $dewi = User::where('legacy_id', $google)->firstOrFail();
        $this->assertStringStartsWith('$2y$', $dewi->password);
        $this->post('/login', ['username' => 'dewi@gmail.com', 'password' => 'JAoqwj98129!0398@9819'])
            ->assertSessionHasErrors('username');

        $this->assertNull(User::where('legacy_id', $conflict)->first());

        $csv = Storage::disk('local')->get(Storage::disk('local')->files('ppdb-import')[0]);
        $rows = array_map(fn (string $line) => str_getcsv($line, escape: ''), array_values(array_filter(explode("\n", $csv))));
        $this->assertSame(['id_ppdb2020', 'nama', 'peran', 'login_lama', 'username_baru', 'email', 'catatan'], $rows[0]);
        $notes = array_column(array_slice($rows, 1), 6, 3);
        $this->assertSame('Masuk dengan username "ani.lestari" dan password lama.', $notes['ani.lestari']);
        $this->assertStringStartsWith('Username berubah dari "budisantoso" menjadi "budisantoso_2"', $notes['budisantoso']);
        $this->assertStringStartsWith('Akun Google tanpa password: atur ulang password di Data Siswa', $notes['dewi@gmail.com']);
    }

    public function test_admins_need_the_admins_option(): void
    {
        $id = $this->legacyUser(['name' => 'Operator', 'email' => 'operator', 'apakah_admin' => '1']);

        $this->artisan('ppdb:import-2020')->assertSuccessful();
        $this->assertNull(User::where('legacy_id', $id)->first());

        $this->artisan('ppdb:import-2020', ['--admins' => true])->assertSuccessful();
        $admin = User::where('legacy_id', $id)->firstOrFail();
        $this->assertTrue($admin->isAdmin());
        $this->assertNull($admin->jenjang);
    }

    public function test_year_filter(): void
    {
        $old = $this->legacyUser(['email' => 'lama@example.com', 'year' => '2022']);
        $new = $this->legacyUser(['email' => 'baru@example.com', 'year' => '2024']);
        $undated = $this->legacyUser(['email' => 'tanpa@example.com', 'year' => null, 'created_at' => '2021-02-01 00:00:00']);

        $this->artisan('ppdb:import-2020', ['--year' => ['2024', '2021']])
            ->expectsOutputToContain('2021: 1, 2022: 1, 2024: 1')
            ->assertSuccessful();

        $this->assertNull(User::where('legacy_id', $old)->first());
        $this->assertNotNull(User::where('legacy_id', $new)->first());
        $this->assertNotNull(User::where('legacy_id', $undated)->first());
    }

    public function test_values_outside_the_choices_stay_valid(): void
    {
        $id = $this->legacyUser(biodata: [
            'jenis_kelamin' => 'LAKI-LAKI',
            'tingkat_lomba' => 'Kecamatan',
            'jarak_rumah_sekolah' => 'Sekitar 3 KM',
            'tanggal_lahir' => '31 Februari',
            'anak_ke' => 'pertama',
        ]);

        $this->artisan('ppdb:import-2020')
            ->expectsOutputToContain('Jarak Rumah ke Sekolah: Sekitar 3 KM')
            ->expectsOutputToContain('not a date')
            ->assertSuccessful();

        $user = User::where('legacy_id', $id)->firstOrFail();
        $this->assertSame('Laki-Laki', $this->answer($user, 'jenis_kelamin'));
        $this->assertSame('Kecamatan', $this->answer($user, 'tingkat_lomba'));
        $this->assertSame('Sekitar 3 KM', $this->answer($user, 'jarak_rumah_sekolah'));
        $this->assertContains('Sekitar 3 KM', $this->maField('jarak_rumah_sekolah')->options);
        $this->assertSame('31 Februari', $this->answer($user, 'tanggal_lahir'));
        $this->assertSame('pertama', $this->answer($user, 'anak_ke'));
    }

    public function test_imported_student_sees_their_data_in_the_app(): void
    {
        $id = $this->legacyUser(biodata: ['nama' => 'SITI AMINAH', 'tanggal_lahir' => '17/05/2008']);
        $this->legacySubmission($id, 'failed', 'Nama ibu belum diisi.');

        $this->artisan('ppdb:import-2020')->assertSuccessful();
        $user = User::where('legacy_id', $id)->firstOrFail();
        $menu = $this->maField('nama')->menu;

        $this->actingAs($user)->get("/formulir/{$menu->id}")->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Form')
                ->where('canEdit', true)
                ->where("values.{$this->maField('nama')->id}", 'SITI AMINAH')
                ->where("values.{$this->maField('tanggal_lahir')->id}", '2008-05-17'));

        $this->actingAs($user)->get('/dashboard')->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('profil.status', 'perlu_perbaikan')
                ->where('profil.catatan_admin', 'Nama ibu belum diisi.'));

        $admin = User::factory()->admin()->create();
        $this->actingAs($admin)->get("/admin/siswa/{$user->id}")->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('student.legacy_id', $id));
    }

    public function test_registration_waves_and_exam_logins_are_imported(): void
    {
        DB::connection('ppdb2020')->table('regist_sessions')->insert([
            ['regist_name' => 'Gelombang 1', 'open' => '2024-02-01 00:00:00', 'close' => '2024-03-31 23:59:00', 'year' => '2024'],
            ['regist_name' => 'Gelombang 2', 'open' => '2024-04-01 00:00:00', 'close' => '2024-05-31 23:59:00', 'year' => '2024'],
        ]);
        $early = $this->legacyUser(['email' => 'awal@example.com', 'created_at' => '2024-03-01 08:00:00']);
        $late = $this->legacyUser(['email' => 'akhir@example.com', 'created_at' => '2024-04-20 08:00:00']);
        $this->legacySubmission($early, 'success');
        $this->legacyResult($early, 3, 'waiting');

        $this->artisan('ppdb:import-2020')
            ->expectsOutputToContain('Registration periods created: Gelombang 1 2024')
            ->expectsOutputToContain('Registration for Madrasah Aliyah is now closed')
            ->assertSuccessful();

        $periods = RegistrationPeriod::orderBy('opens_at')->get();
        $this->assertSame(['Gelombang 1 2024', 'Gelombang 2 2024'], $periods->pluck('name')->all());
        $this->assertSame(Jenjang::MA, $periods[0]->jenjang);

        $first = User::where('legacy_id', $early)->firstOrFail();
        $this->assertSame($periods[0]->id, $first->registration_period_id);
        $this->assertSame($periods[1]->id, User::where('legacy_id', $late)->value('registration_period_id'));

        // The e-learning login printed on the old exam card.
        $this->assertSame('0081234567', $first->exam_username);
        $this->assertSame('KODE123456', $first->exam_password);

        // Running again does not duplicate periods.
        $this->artisan('ppdb:import-2020', ['--update' => true])->assertSuccessful();
        $this->assertSame(2, RegistrationPeriod::count());
    }

    public function test_missing_connection_fails_cleanly(): void
    {
        config(['database.connections.ppdb2020.database' => '/nonexistent/ppdb2020.sqlite']);
        DB::purge('ppdb2020');

        $this->artisan('ppdb:import-2020')
            ->expectsOutputToContain('Cannot connect to the ppdb2020 database')
            ->assertFailed();
    }

    public function test_default_field_keys_are_backfilled_for_existing_installs(): void
    {
        FormField::query()->update(['key' => null]);

        (require database_path('migrations/2026_10_01_000002_backfill_form_field_keys.php'))->up();

        $this->assertEqualsCanonicalizing(
            ['mi', 'mts', 'ma'],
            FormField::where('key', 'nisn')->with('menu')->get()->map(fn (FormField $field) => $field->menu->jenjang->value)->all(),
        );
        $this->assertSame(3, FormField::where('key', 'nisn')->count());
        $this->assertSame(3, FormField::where('key', 'tanggal_lahir')->count());
        $this->assertSame(0, FormField::where('label', 'Tahun')->whereNotNull('key')->count());
    }
}
