<?php

namespace App\Http\Controllers;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Services\Admission;
use App\Services\RegistrationSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Registration for a jenjang with a fee, as in ppdb2020: the applicant sends
 * a transfer proof without an account, the committee checks it and creates
 * the account. The applicant follows the submission with its tracking code.
 */
class RegistrationPaymentController extends Controller
{
    public function store(Request $request, Admission $admission, RegistrationSchedule $schedule): RedirectResponse
    {
        $data = $request->validate([
            'jenjang' => ['required', Rule::enum(Jenjang::class), function (string $attribute, mixed $value, \Closure $fail) use ($admission, $schedule) {
                $jenjang = Jenjang::tryFrom((string) $value);
                $status = $jenjang ? $schedule->for($jenjang) : null;

                if ($status && ! $status['open']) {
                    $fail("Pendaftaran {$jenjang->label()} sedang ditutup.");
                } elseif ($status && $admission->feeForNewRegistrant($jenjang, $status['current']) === 0) {
                    $fail("Pendaftaran {$jenjang->label()} tidak dipungut biaya. Buat akun langsung.");
                }
            }],
            'name' => ['required', 'string', 'max:255'],
            'no_hp' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'email' => ['nullable', 'email', 'max:255'],
            ...$this->proofRules(),
        ], [], $this->attributes());

        $jenjang = Jenjang::from($data['jenjang']);
        $period = $schedule->currentPeriod($jenjang);
        $payment = Payment::newApplicant()->fill([
            'jenjang' => $jenjang,
            'registration_period_id' => $period?->id,
            'applicant_name' => $data['name'],
            'phone' => $data['no_hp'],
            'email' => $data['email'] ?? null,
            'amount' => $admission->feeForNewRegistrant($jenjang, $period),
            'method' => Payment::METHOD_TRANSFER,
        ]);
        $this->storeProof($payment, $data);
        ActivityLog::record('pembayaran.kirim', "{$payment->applicant_name} mendaftar {$jenjang->shortLabel()} dan mengirim bukti pembayaran", properties: ['kode' => $payment->codeLabel()]);

        return redirect()->route('pengajuan.show', $payment->code)
            ->with('success', 'Bukti pembayaran terkirim. Simpan kode pengajuan di bawah untuk memantau pendaftaranmu.');
    }

    /**
     * The status of a submission, and the new account's login once the
     * committee has accepted the payment.
     */
    public function show(Payment $payment, Admission $admission): Response
    {
        $user = $payment->user;
        $jenjang = $user?->jenjang ?? $payment->jenjang;

        return Inertia::render('Auth/Pengajuan', [
            'pengajuan' => [
                'code' => $payment->codeLabel(),
                'name' => $user?->name ?? $payment->applicant_name,
                'jenjang' => $jenjang?->label(),
                'jenjang_kode' => $jenjang?->value,
                'gelombang' => $payment->registrationPeriod?->name,
                'amount_label' => Payment::rupiah($payment->amount),
                'status' => $payment->status->value,
                'status_label' => $payment->status->label(),
                'note' => $payment->status === PaymentStatus::Ditolak ? $payment->note : null,
                'submitted_at' => $payment->submitted_at?->translatedFormat('j F Y, H.i'),
                'proof_name' => $payment->proof_name,
                'sender_name' => $payment->sender_name,
                'canUpload' => $user === null && $payment->status !== PaymentStatus::Diterima,
                'account' => $user ? [
                    'username' => $user->username,
                    'password' => $payment->account_password,
                ] : null,
            ],
            'rekening' => $admission->bankAccount($jenjang),
        ]);
    }

    /**
     * A new proof, after a rejection or to replace a wrong file.
     */
    public function update(Request $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->isApplicant() && $payment->status !== PaymentStatus::Diterima, 403);

        $data = $request->validate($this->proofRules(), [], $this->attributes());
        $this->storeProof($payment, $data);
        ActivityLog::record('pembayaran.kirim_ulang', "{$payment->applicant_name} mengirim ulang bukti pembayaran", properties: ['kode' => $payment->codeLabel()]);

        return back()->with('success', 'Bukti pembayaran baru terkirim. Panitia akan memeriksanya kembali.');
    }

    public function lookup(): Response
    {
        return Inertia::render('Auth/CekPendaftaran');
    }

    public function find(Request $request): RedirectResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:30']], [], ['code' => 'kode pengajuan']);
        $code = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $data['code']));

        if (! Payment::where('code', $code)->exists()) {
            return back()->withErrors(['code' => 'Kode pengajuan tidak ditemukan. Periksa kembali kodenya.']);
        }

        return redirect()->route('pengajuan.show', $code);
    }

    /**
     * @return array<string, mixed>
     */
    private function proofRules(): array
    {
        return [
            'sender_name' => ['required', 'string', 'max:150'],
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function attributes(): array
    {
        return [
            'name' => 'nama calon siswa',
            'no_hp' => 'nomor WhatsApp',
            'sender_name' => 'nama pengirim',
            'proof' => 'bukti pembayaran',
        ];
    }

    /**
     * Save the uploaded proof (replacing an older one) and wait for the committee.
     *
     * @param  array<string, mixed>  $data
     */
    private function storeProof(Payment $payment, array $data): void
    {
        $old = $payment->proof_path;

        $payment->fill([
            'status' => PaymentStatus::Menunggu,
            'proof_path' => $data['proof']->store("ppdb/pembayaran/{$payment->code}", 'local'),
            'proof_name' => $data['proof']->getClientOriginalName(),
            'sender_name' => $data['sender_name'],
            'note' => null,
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
        ])->save();

        if ($old) {
            Storage::disk('local')->delete($old);
        }
    }
}
