<?php

namespace App\Services;

use App\Enums\Jenjang;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Support\ReadableCode;
use Illuminate\Support\Str;

/**
 * Student accounts made by the committee, as ppdb2020 made them after
 * checking a payment: the password is generated so it can be printed on a
 * login card or sent over WhatsApp.
 */
final class StudentAccounts
{
    /**
     * @return array{0: User, 1: string} the new account and its password
     */
    public function create(
        Jenjang $jenjang,
        string $name,
        ?string $phone = null,
        ?string $email = null,
        ?RegistrationPeriod $period = null,
        ?string $username = null,
    ): array {
        $password = ReadableCode::generate();

        $student = new User([
            'jenjang' => $jenjang,
            'name' => $name,
            'username' => $username ?? $this->username($name),
            'no_hp' => $phone,
            // Email is a login too, so it must stay unique.
            'email' => $email && ! User::where('email', $email)->exists() ? $email : null,
            'password' => $password,
        ]);
        $student->registration_period_id = $period?->id;
        $student->save();

        return [$student, $password];
    }

    /**
     * A free username made from the student's name, e.g. "siti_aminah2".
     */
    public function username(string $name): string
    {
        $base = Str::of($name)->ascii()->lower()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->limit(24, '')->value();
        $base = strlen($base) >= 4 ? $base : 'siswa_'.$base;
        $username = rtrim($base, '_');

        for ($i = 2; User::where('username', $username)->exists(); $i++) {
            $username = "{$base}{$i}";
        }

        return $username;
    }

    /**
     * A wa.me link that opens WhatsApp with the login details addressed to
     * the student's phone number, or null when they have none.
     */
    public function whatsappLink(User $student, string $password): ?string
    {
        $digits = preg_replace('/\D/', '', (string) $student->no_hp);

        if ($digits === '') {
            return null;
        }

        $phone = match (true) {
            str_starts_with($digits, '62') => $digits,
            str_starts_with($digits, '0') => '62'.substr($digits, 1),
            default => '62'.$digits,
        };
        $school = config('ppdb.sekolah.nama');

        $message = implode("\n", [
            "Assalamu'alaikum. Akun pendaftaran {$student->name} di {$school} sudah dibuat.",
            '',
            "Username: {$student->username}",
            "Password: {$password}",
            '',
            'Silakan masuk di '.route('login').' untuk melengkapi formulir pendaftaran.',
            '',
            "Panitia PPDB {$school}",
        ]);

        return "https://wa.me/{$phone}?text=".rawurlencode($message);
    }
}
