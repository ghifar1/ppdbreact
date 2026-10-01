<?php

namespace App\Services;

use App\Enums\StatusPendaftaran;
use App\Models\User;
use App\Support\ReadableCode;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * What a verified student needs for the exam: a participant number (nomor
 * peserta), counted per jenjang and registration year, and a login for the
 * external exam (e-learning/CBT) system as ppdb2020 had it: the username is
 * the student's NISN and the password a random code. Both are shown in plain
 * text on the exam card and in the admin export.
 */
final class ExamAccounts
{
    private const PASSWORD_LENGTH = 10;

    public function __construct(private FormService $forms) {}

    /**
     * Students who can sit the exam, i.e. whose data has been verified.
     *
     * @return Builder<User>
     */
    public function eligible(): Builder
    {
        return User::query()
            ->where('role', User::ROLE_STUDENT)
            ->whereIn('status', array_filter(StatusPendaftaran::cases(), fn (StatusPendaftaran $status) => $status->hasExamCard()));
    }

    /**
     * Give the student a participant number and an exam account if they have
     * none. Returns true when an account was created.
     */
    public function ensure(User $user): bool
    {
        $this->assignNumber($user);

        if ($user->exam_username !== null) {
            return false;
        }

        $user->forceFill([
            'exam_username' => $this->username($user),
            'exam_password' => $this->password(),
        ])->save();

        return true;
    }

    /**
     * The next participant number of the student's jenjang and registration year.
     */
    public function assignNumber(User $user): void
    {
        if ($user->exam_number !== null || $user->jenjang === null) {
            return;
        }

        $year = (int) ($user->created_at ?? now())->format('Y');

        // Two admins verifying at the same moment could pick the same number;
        // the unique index rejects the second, which then takes the next one.
        for ($attempt = 1; ; $attempt++) {
            $next = (int) User::where('jenjang', $user->jenjang)->where('exam_year', $year)->max('exam_number') + 1;

            try {
                $user->forceFill(['exam_number' => $next, 'exam_year' => $year])->save();

                return;
            } catch (UniqueConstraintViolationException $e) {
                $user->forceFill(['exam_number' => null, 'exam_year' => null]);

                if ($attempt === 3) {
                    throw $e;
                }
            }
        }
    }

    /**
     * New password for an existing account (or a new account).
     */
    public function resetPassword(User $user): void
    {
        if ($this->ensure($user)) {
            return;
        }

        $user->forceFill(['exam_password' => $this->password()])->save();
    }

    /**
     * Create accounts for every eligible student who has none.
     */
    public function ensureAll(): int
    {
        $created = 0;

        $this->eligible()
            ->where(fn (Builder $query) => $query->whereNull('exam_username')->orWhereNull('exam_number'))
            ->orderBy('id')
            ->each(function (User $user) use (&$created) {
                $created += (int) $this->ensure($user);
            });

        return $created;
    }

    /**
     * The NISN from the student's answers when it is usable and free,
     * otherwise their registration number.
     */
    public function username(User $user): string
    {
        $nisn = preg_replace('/\s+/', '', (string) ($this->forms->keyedAnswers(collect([$user]), ['nisn'])->get($user->id)['nisn'] ?? ''));

        $candidates = array_filter([
            preg_match('/^[0-9A-Za-z]{4,50}$/', $nisn) ? $nisn : null,
            $user->nomorPendaftaran(),
        ]);

        foreach ($candidates as $candidate) {
            if (! User::where('exam_username', $candidate)->whereKeyNot($user->id)->exists()) {
                return $candidate;
            }
        }

        return $user->nomorPendaftaran().'-'.$user->id;
    }

    public function password(): string
    {
        return ReadableCode::generate(self::PASSWORD_LENGTH);
    }

    /**
     * Rows for the CSV the exam system imports, in the column order of
     * ppdb2020's e-learning export.
     *
     * @param  Collection<int, User>  $users
     * @return list<array<string, string>>
     */
    public function exportRows(Collection $users): array
    {
        $answers = $this->forms->keyedAnswers($users, ['nisn', 'nama_sekolah', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir']);

        return $users->map(function (User $user) use ($answers) {
            $data = $answers->get($user->id, []);
            $gender = Str::lower($data['jenis_kelamin'] ?? '');
            $birth = $data['tanggal_lahir'] ?? '';

            return [
                'no_pendaftaran' => $user->nomorPendaftaran(),
                'username' => (string) $user->exam_username,
                'password' => (string) $user->exam_password,
                'nama' => $user->name,
                'jenjang' => (string) $user->jenjang?->shortLabel(),
                'nisn' => $data['nisn'] ?? '',
                'asal_sekolah' => $data['nama_sekolah'] ?? '',
                'jenis_kelamin' => match (true) {
                    str_starts_with($gender, 'l') => 'L',
                    str_starts_with($gender, 'p') => 'P',
                    default => '',
                },
                'tempat_lahir' => $data['tempat_lahir'] ?? '',
                'tanggal_lahir' => preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $birth, $m) ? "{$m[3]}-{$m[2]}-{$m[1]}" : $birth,
            ];
        })->all();
    }
}
