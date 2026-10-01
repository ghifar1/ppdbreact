<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Models\User;
use App\Services\StudentAccounts;
use App\Support\RegistrationYears;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in([...array_column(PaymentStatus::cases(), 'value'), 'semua'])],
            'jenjang' => ['nullable', Rule::enum(Jenjang::class)],
            'q' => ['nullable', 'string', 'max:100'],
            'tahun' => ['nullable', 'string', 'max:10'],
        ]);
        $status = $filters['status'] ?? PaymentStatus::Menunggu->value;
        $year = RegistrationYears::selected($filters['tahun'] ?? null);

        $payments = Payment::query()
            ->with(['user', 'reviewer', 'registrationPeriod'])
            // Applicants have no account yet, so their details are on the payment.
            ->when($filters['jenjang'] ?? null, fn (Builder $query, string $jenjang) => $query->where(fn (Builder $query) => $query
                ->where('jenjang', $jenjang)
                ->orWhereHas('user', fn (Builder $query) => $query->where('jenjang', $jenjang))))
            ->when($filters['q'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $query) => $query
                ->where('applicant_name', 'like', "%{$search}%")
                ->orWhere('code', 'like', '%'.preg_replace('/[^A-Za-z0-9]/', '', $search).'%')
                ->orWhereHas('user', fn (Builder $query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%"))))
            ->when($status !== 'semua', fn (Builder $query) => $query->where('status', $status))
            ->when($year, fn (Builder $query, int $year) => $query->whereYear('payments.created_at', $year))
            ->orderByRaw('submitted_at is null')
            ->orderBy($status === PaymentStatus::Menunggu->value ? 'submitted_at' : 'updated_at', $status === PaymentStatus::Menunggu->value ? 'asc' : 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Payment $payment) => $payment->present() + [
                'student' => $payment->user ? [
                    'id' => $payment->user->id,
                    'name' => $payment->user->name,
                    'username' => $payment->user->username,
                    'nomor_pendaftaran' => $payment->user->nomorPendaftaran(),
                    'jenjang' => $payment->user->jenjang?->value,
                    'jenjang_label' => $payment->user->jenjang?->shortLabel(),
                ] : null,
            ]);

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => ['status' => $status, 'jenjang' => $filters['jenjang'] ?? '', 'q' => $filters['q'] ?? '', 'tahun' => $year ? (string) $year : ''],
            'tahunOptions' => RegistrationYears::options(),
            'counts' => Payment::query()
                ->when($year, fn (Builder $query, int $year) => $query->whereYear('created_at', $year))
                ->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'statusOptions' => PaymentStatus::options(),
            'jenjangOptions' => Jenjang::options(),
        ]);
    }

    /**
     * Accept a payment. For an applicant this also creates their account and
     * opens the login card to hand over or send by WhatsApp.
     */
    public function confirm(Request $request, Payment $payment, StudentAccounts $accounts): RedirectResponse
    {
        $review = ['status' => PaymentStatus::Diterima, 'note' => null, 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()];

        if (! $payment->isApplicant()) {
            $payment->update($review);
            ActivityLog::record('pembayaran.terima', "Menerima pembayaran {$payment->user->name}", $payment->user);

            return back()->with('success', "Pembayaran {$payment->user->name} dikonfirmasi lunas.");
        }

        $created = DB::transaction(function () use ($payment, $accounts, $review) {
            // A second click must not make a second account.
            $payment = Payment::lockForUpdate()->findOrFail($payment->id);

            if (! $payment->isApplicant()) {
                return null;
            }

            [$student, $password] = $accounts->create(
                $payment->jenjang, $payment->applicant_name, $payment->phone, $payment->email, $payment->registrationPeriod,
            );
            $payment->forceFill(['user_id' => $student->id, 'account_password' => $password] + $review)->save();

            return [$student, $password];
        });

        if ($created === null) {
            return back()->with('error', 'Akun untuk pembayaran ini sudah dibuat.');
        }

        [$student, $password] = $created;
        ActivityLog::record('pembayaran.terima', "Menerima pembayaran {$student->name} dan membuat akunnya (@{$student->username})", $student, ['kode' => $payment->codeLabel()]);

        return redirect()->route('admin.students.login-card', $student)
            ->with('loginCard', ['student' => $student->id, 'password' => $password])
            ->with('success', "Pembayaran {$student->name} diterima dan akunnya dibuat. Kirim atau cetak kartu loginnya; siswa juga bisa melihatnya dengan kode pengajuan.");
    }

    public function reject(Request $request, Payment $payment): RedirectResponse
    {
        $data = $request->validate(['note' => ['required', 'string', 'max:1000']], [], ['note' => 'alasan penolakan']);

        $payment->update([
            'status' => PaymentStatus::Ditolak,
            'note' => $data['note'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $name = $payment->user?->name ?? $payment->applicant_name;
        ActivityLog::record('pembayaran.tolak', "Menolak pembayaran {$name}", $payment->user, array_filter(['kode' => $payment->codeLabel(), 'alasan' => $data['note']]));

        return back()->with('success', "Pembayaran {$name} ditolak. Alasannya terlihat di halaman status pendaftarannya.");
    }

    /**
     * Record a payment checked outside the app: cash at the school office,
     * or a transfer the student showed the committee.
     */
    public function record(Request $request, User $student): RedirectResponse
    {
        abort_if($student->isAdmin(), 404);

        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:0', 'max:100000000'],
            'method' => ['required', Rule::in([Payment::METHOD_CASH, Payment::METHOD_TRANSFER])],
            'note' => ['nullable', 'string', 'max:1000'],
        ], [], ['amount' => 'jumlah', 'method' => 'cara bayar', 'note' => 'catatan']);

        $student->payment()->updateOrCreate([], [
            'amount' => $data['amount'],
            'jenjang' => $student->jenjang,
            'method' => $data['method'],
            'status' => PaymentStatus::Diterima,
            'note' => $data['note'] ?? null,
            'submitted_at' => now(),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        ActivityLog::record('pembayaran.catat', "Mencatat pembayaran {$student->name} sebesar ".Payment::rupiah($data['amount'])." ({$data['method']})", $student);

        return back()->with('success', "Pembayaran {$student->name} sebesar ".Payment::rupiah($data['amount']).' dicatat lunas.');
    }
}
