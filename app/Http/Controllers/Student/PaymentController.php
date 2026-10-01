<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\Admission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The student's registration fee. Proofs are uploaded on the registration
 * page before an account exists (see RegistrationPaymentController), so a
 * logged-in student only sees the payment and how to pay what is still due.
 */
class PaymentController extends Controller
{
    public function show(Request $request, Admission $admission): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $admission->paymentRequired($user)) {
            return redirect()->route('dashboard')->with('success', 'Tidak ada biaya pendaftaran untuk jenjangmu.');
        }

        return Inertia::render('User/Payment', [
            'summary' => $admission->paymentSummary($user),
            'payment' => $user->payment?->present(),
            'rekening' => $admission->bankAccount($user->jenjang),
        ]);
    }
}
