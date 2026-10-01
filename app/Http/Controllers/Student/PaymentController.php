<?php

namespace App\Http\Controllers\Student;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Admission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function show(Request $request, Admission $admission): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $admission->paymentRequired($user)) {
            return redirect()->route('dashboard')->with('success', 'Tidak ada biaya pendaftaran untuk jenjangmu.');
        }

        $settings = $admission->settings($user->jenjang);

        return Inertia::render('User/Payment', [
            'summary' => $admission->paymentSummary($user),
            'payment' => $user->payment?->present(),
            'rekening' => [
                'bank' => $settings->bank_name,
                'nomor' => $settings->account_number,
                'nama' => $settings->account_name,
                'catatan' => $settings->payment_notes,
            ],
            'canUpload' => $user->payment?->status !== PaymentStatus::Diterima,
        ]);
    }

    public function store(Request $request, Admission $admission): RedirectResponse
    {
        $user = $request->user();

        abort_unless($admission->paymentRequired($user), 404);

        $payment = $user->payment()->first();

        if ($payment?->status === PaymentStatus::Diterima) {
            return back()->with('error', 'Pembayaranmu sudah dikonfirmasi lunas.');
        }

        $data = $request->validate([
            'sender_name' => ['required', 'string', 'max:150'],
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ], [], [
            'sender_name' => 'nama pengirim',
            'proof' => 'bukti pembayaran',
        ]);

        $old = $payment?->proof_path;
        $file = $data['proof'];

        $payment = $user->payment()->updateOrCreate([], [
            'amount' => $admission->fee($user),
            'method' => Payment::METHOD_TRANSFER,
            'status' => PaymentStatus::Menunggu,
            'proof_path' => $file->store("ppdb/{$user->id}/pembayaran", 'local'),
            'proof_name' => $file->getClientOriginalName(),
            'sender_name' => $data['sender_name'],
            'note' => null,
            'submitted_at' => now(),
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
        $user->setRelation('payment', $payment);

        if ($old) {
            Storage::disk('local')->delete($old);
        }

        return redirect()->route('pembayaran')->with('success', 'Bukti pembayaran terkirim. Panitia akan memeriksanya.');
    }
}
