<?php

namespace App\Services;

use App\Enums\StatusPendaftaran;
use App\Models\FormAnswer;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Logins for the external exam (e-learning/CBT) system, as ppdb2020 had them:
 * the username is the student's NISN and the password a random code. Both
 * are shown in plain text on the exam card and in the admin export.
 */
final class ExamAccounts
{
    /** No 0/O, 1/I/L, so codes can be read off a printed card. */
    private const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    private const PASSWORD_LENGTH = 10;

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
     * Give the student an exam account if they have none. Returns true when one was created.
     */
    public function ensure(User $user): bool
    {
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

        $this->eligible()->whereNull('exam_username')->orderBy('id')->each(function (User $user) use (&$created) {
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
        $nisn = preg_replace('/\s+/', '', (string) ($this->answers(collect([$user]), ['nisn'])->get($user->id)['nisn'] ?? ''));

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
        return collect(range(1, self::PASSWORD_LENGTH))
            ->map(fn () => self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)])
            ->implode('');
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
        $answers = $this->answers($users, ['nisn', 'nama_sekolah', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir']);

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

    /**
     * Answers of keyed fields, per user: [user_id => [key => value]].
     *
     * @param  Collection<int, User>  $users
     * @param  list<string>  $keys
     * @return Collection<int, array<string, string>>
     */
    private function answers(Collection $users, array $keys): Collection
    {
        return FormAnswer::query()
            ->join('form_fields', 'form_fields.id', '=', 'form_answers.form_field_id')
            ->whereIn('form_answers.user_id', $users->pluck('id'))
            ->whereIn('form_fields.key', $keys)
            ->get(['form_answers.user_id', 'form_fields.key', 'form_answers.value'])
            ->groupBy('user_id')
            ->map(fn (Collection $rows) => $rows->pluck('value', 'key')->map(fn ($value) => (string) $value)->all());
    }
}
