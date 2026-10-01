<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Enums\StatusPendaftaran;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Support\RegistrationYears;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $year = RegistrationYears::selected($request->query('tahun'), (int) now()->format('Y'));

        $counts = User::query()
            ->where('role', User::ROLE_STUDENT)
            ->registeredIn($year)
            ->selectRaw('jenjang, status, count(*) as total')
            ->groupBy('jenjang', 'status')
            ->get();

        $count = fn (?Jenjang $jenjang = null, ?StatusPendaftaran $status = null) => (int) $counts
            ->filter(fn ($row) => (! $jenjang || $row->jenjang === $jenjang) && (! $status || $row->status === $status))
            ->sum('total');

        return Inertia::render('Admin/Dashboard', [
            'jenjang' => array_map(fn (Jenjang $jenjang) => [
                'value' => $jenjang->value,
                'label' => $jenjang->label(),
                'total' => $count($jenjang),
                'menunggu' => $count($jenjang, StatusPendaftaran::MenungguVerifikasi),
            ], Jenjang::cases()),
            'status' => array_map(fn (StatusPendaftaran $status) => [
                'value' => $status->value,
                'label' => $status->label(),
                'total' => $count(null, $status),
            ], StatusPendaftaran::cases()),
            'total' => $count(),
            'pembayaranMenunggu' => Payment::where('status', PaymentStatus::Menunggu)->count(),
            'tahun' => $year ? (string) $year : RegistrationYears::ALL,
            'tahunOptions' => RegistrationYears::options(),
        ]);
    }
}
