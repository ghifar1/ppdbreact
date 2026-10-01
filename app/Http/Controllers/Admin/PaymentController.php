<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);
        $status = $filters['status'] ?? PaymentStatus::Menunggu->value;

        $payments = Payment::query()
            ->with(['user', 'reviewer'])
            ->whereHas('user', fn (Builder $query) => $query
                ->when($filters['jenjang'] ?? null, fn (Builder $query, string $jenjang) => $query->where('jenjang', $jenjang))
                ->when($filters['q'] ?? null, fn (Builder $query, string $search) => $query->where(fn (Builder $query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%"))))
            ->when($status !== 'semua', fn (Builder $query) => $query->where('status', $status))
            ->orderByRaw('submitted_at is null')
            ->orderBy($status === PaymentStatus::Menunggu->value ? 'submitted_at' : 'updated_at', $status === PaymentStatus::Menunggu->value ? 'asc' : 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Payment $payment) => $payment->present() + [
                'student' => [
                    'id' => $payment->user->id,
                    'name' => $payment->user->name,
                    'username' => $payment->user->username,
                    'nomor_pendaftaran' => $payment->user->nomorPendaftaran(),
                    'jenjang' => $payment->user->jenjang?->value,
                    'jenjang_label' => $payment->user->jenjang?->shortLabel(),
                ],
            ]);

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => ['status' => $status, 'jenjang' => $filters['jenjang'] ?? '', 'q' => $filters['q'] ?? ''],
            'counts' => Payment::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'statusOptions' => PaymentStatus::options(),
            'jenjangOptions' => Jenjang::options(),
        ]);
    }

    public function confirm(Request $request, Payment $payment): RedirectResponse
    {
        $payment->update([
            'status' => PaymentStatus::Diterima,
            'note' => null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', "Pembayaran {$payment->user->name} dikonfirmasi lunas.");
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

        return back()->with('success', "Pembayaran {$payment->user->name} ditolak. Siswa diminta mengunggah ulang.");
    }

    /**
     * Record a payment made in cash at the school office.
     */
    public function recordCash(Request $request, User $student): RedirectResponse
    {
        abort_if($student->isAdmin(), 404);

        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:0', 'max:100000000'],
            'note' => ['nullable', 'string', 'max:1000'],
        ], [], ['amount' => 'jumlah', 'note' => 'catatan']);

        $student->payment()->updateOrCreate([], [
            'amount' => $data['amount'],
            'method' => Payment::METHOD_CASH,
            'status' => PaymentStatus::Diterima,
            'note' => $data['note'] ?? null,
            'submitted_at' => now(),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', "Pembayaran tunai {$student->name} sebesar ".Payment::rupiah($data['amount']).' dicatat.');
    }
}
