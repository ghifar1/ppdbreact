<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentProofController extends Controller
{
    /**
     * The uploaded proof of payment. Only the student and admins may see it.
     */
    public function __invoke(Request $request, Payment $payment): StreamedResponse
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $payment->user_id === $user->id, 403);
        abort_unless($payment->proof_path && Storage::disk('local')->exists($payment->proof_path), 404);

        return Storage::disk('local')->response($payment->proof_path, $payment->proof_name);
    }
}
