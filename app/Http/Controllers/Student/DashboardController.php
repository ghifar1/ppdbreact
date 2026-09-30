<?php

namespace App\Http\Controllers\Student;

use App\Enums\StatusPendaftaran;
use App\Http\Controllers\Controller;
use App\Services\ExamAccounts;
use App\Services\FormService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private FormService $forms) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('User/Dashboard/Index', [
            'profil' => [
                'nama' => $user->name,
                'username' => $user->username,
                'no_hp' => $user->no_hp,
                'jenjang' => $user->jenjang?->label(),
                'jenjang_kode' => $user->jenjang?->value,
                'nomor_pendaftaran' => $user->nomorPendaftaran(),
                'status' => $user->status->value,
                'status_label' => $user->status->label(),
                'catatan_admin' => $user->catatan_admin,
                'gelombang' => $user->registrationPeriod?->name,
            ],
            'dataLengkap' => $this->forms->isComplete($user),
            // The student's own registration period is more precise than the general schedule.
            'jadwal' => array_merge(config('ppdb.jadwal'), array_filter([
                'pengisian' => $user->registrationPeriod?->present()['range_label'],
            ])),
        ]);
    }

    public function finalize(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->status->canEdit()) {
            return back()->with('error', 'Data sudah diajukan untuk finalisasi.');
        }

        if (! $this->forms->isComplete($user)) {
            return back()->with('error', 'Lengkapi semua isian wajib (*) di setiap menu sebelum finalisasi.');
        }

        $user->forceFill([
            'status' => StatusPendaftaran::MenungguVerifikasi,
            'finalized_at' => now(),
        ])->save();

        return back()->with('success', 'Data berhasil diajukan. Admin akan memeriksa datamu.');
    }

    public function card(Request $request, ExamAccounts $examAccounts): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->status->hasExamCard()) {
            return redirect()->route('dashboard')->with('error', 'Kartu ujian tersedia setelah data diverifikasi admin.');
        }

        // Students verified before exam accounts existed get one here.
        $examAccounts->ensure($user);

        return Inertia::render('User/Kartu', [
            'kartu' => [
                'nomor_pendaftaran' => $user->nomorPendaftaran(),
                'nama' => $user->name,
                'username' => $user->username,
                'jenjang' => $user->jenjang?->label(),
                'jenjang_kode' => $user->jenjang?->value,
                'tahun' => config('ppdb.tahun'),
                'gelombang' => $user->registrationPeriod?->name,
                'exam_username' => $user->exam_username,
                'exam_password' => $user->exam_password,
            ],
        ]);
    }
}
