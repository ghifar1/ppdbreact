<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Services\Admission;
use App\Services\RegistrationSchedule;
use App\Support\ReadableCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Accounts the committee makes for students who register at the school
 * office, and the printable login card (kartu login) with a new password,
 * as ppdb2020 made accounts after checking a payment.
 */
class StudentAccountController extends Controller
{
    public function create(Admission $admission, RegistrationSchedule $schedule): Response
    {
        return Inertia::render('Admin/Students/Create', [
            'jenjangOptions' => Jenjang::options(),
            'periodOptions' => RegistrationPeriod::orderByDesc('opens_at')->get()->map(fn (RegistrationPeriod $period) => [
                'value' => (string) $period->id,
                'label' => $period->name.' · '.($period->jenjang?->shortLabel() ?? 'Semua jenjang'),
                'jenjang' => $period->jenjang?->value,
            ]),
            // What a student registering now would pay, per jenjang (current period included).
            'fees' => collect(Jenjang::cases())->mapWithKeys(fn (Jenjang $jenjang) => [
                $jenjang->value => [
                    'amount' => $admission->feeForNewRegistrant($jenjang, $schedule->currentPeriod($jenjang)),
                    'period' => $schedule->currentPeriod($jenjang)?->name,
                ],
            ]),
        ]);
    }

    public function store(Request $request, Admission $admission, RegistrationSchedule $schedule): RedirectResponse
    {
        $data = $request->validate([
            'jenjang' => ['required', Rule::enum(Jenjang::class)],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'alpha_dash', 'min:4', 'max:30', 'unique:users'],
            'no_hp' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'registration_period_id' => ['nullable', 'integer', Rule::exists('registration_periods', 'id')],
            'paid_cash' => ['boolean'],
        ], [], ['registration_period_id' => 'gelombang', 'no_hp' => 'nomor HP']);

        $jenjang = Jenjang::from($data['jenjang']);
        $period = isset($data['registration_period_id'])
            ? RegistrationPeriod::find($data['registration_period_id'])
            : $schedule->currentPeriod($jenjang);

        if ($period && ! $period->appliesTo($jenjang)) {
            return back()->withErrors(['registration_period_id' => "{$period->name} bukan gelombang untuk {$jenjang->label()}."]);
        }

        $password = ReadableCode::generate();
        $student = new User([
            'jenjang' => $jenjang,
            'name' => $data['name'],
            'username' => $data['username'] ?? $this->username($data['name']),
            'no_hp' => $data['no_hp'] ?? null,
            'password' => $password,
        ]);
        $student->registration_period_id = $period?->id;
        $student->save();

        if ($request->boolean('paid_cash')) {
            $student->payment()->create([
                'amount' => $admission->fee($student),
                'method' => Payment::METHOD_CASH,
                'status' => PaymentStatus::Diterima,
                'submitted_at' => now(),
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        }

        return redirect()->route('admin.students.login-card', $student)
            ->with('loginCard', ['student' => $student->id, 'password' => $password])
            ->with('success', "Akun {$student->name} dibuat. Cetak kartu login dan berikan kepada siswa.");
    }

    /**
     * The login card. The password is only known right after it was made,
     * so the card can be printed once; afterwards a new password is needed.
     */
    public function loginCard(Request $request, User $student): Response
    {
        abort_if($student->isAdmin(), 404);

        $card = $request->session()->get('loginCard');

        return Inertia::render('Admin/Students/LoginCard', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'username' => $student->username,
                'nomor_pendaftaran' => $student->nomorPendaftaran(),
                'jenjang' => $student->jenjang?->label(),
                'jenjang_kode' => $student->jenjang?->value,
                'gelombang' => $student->registrationPeriod?->name,
            ],
            'password' => ($card['student'] ?? null) === $student->id ? $card['password'] : null,
        ]);
    }

    /**
     * Replace the student's password with a new printable one.
     */
    public function newPassword(User $student): RedirectResponse
    {
        abort_if($student->isAdmin(), 404);

        $password = ReadableCode::generate();
        $student->forceFill(['password' => $password])->save();

        return redirect()->route('admin.students.login-card', $student)
            ->with('loginCard', ['student' => $student->id, 'password' => $password])
            ->with('success', "Password baru untuk {$student->name} dibuat. Password lama tidak berlaku lagi.");
    }

    private function username(string $name): string
    {
        $base = Str::of($name)->ascii()->lower()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->limit(24, '')->value();
        $base = strlen($base) >= 4 ? $base : 'siswa_'.$base;
        $username = rtrim($base, '_');

        for ($i = 2; User::where('username', $username)->exists(); $i++) {
            $username = "{$base}{$i}";
        }

        return $username;
    }
}
