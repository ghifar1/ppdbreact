<?php

namespace App\Http\Controllers\Student;

use App\Enums\StatusPendaftaran;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ExamSchedule;
use App\Models\User;
use App\Services\Admission;
use App\Services\ExamAccounts;
use App\Services\FormService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private FormService $forms) {}

    public function index(Request $request, Admission $admission): Response
    {
        $user = $request->user();
        $status = $admission->visibleStatus($user);
        $complete = $this->forms->isComplete($user);
        $settings = $admission->settings($user->jenjang);
        $cardBlocker = $admission->cardBlocker($user);

        return Inertia::render('User/Dashboard/Index', [
            'profil' => [
                'nama' => $user->name,
                'username' => $user->username,
                'photo_url' => $user->photoUrl(),
                'no_hp' => $user->no_hp,
                'jenjang' => $user->jenjang?->label(),
                'jenjang_kode' => $user->jenjang?->value,
                'nomor_pendaftaran' => $user->nomorPendaftaran(),
                'nomor_peserta' => $user->nomorPeserta(),
                'status' => $status->value,
                'status_label' => $status->label(),
                'catatan_admin' => $user->catatan_admin,
                'gelombang' => $user->registrationPeriod?->name,
            ],
            'dataLengkap' => $complete,
            'pembayaran' => $admission->paymentSummary($user),
            'finalisasi' => [
                'blocker' => $admission->finalizationBlocker($user, $complete),
                'window' => $settings->finalizationWindow()->present(),
            ],
            'kartu' => ['available' => $cardBlocker === null, 'message' => $cardBlocker],
            'pengumuman' => $settings->announcement_at?->translatedFormat('l, j F Y, H.i'),
            'jadwal' => $admission->timeline($user->jenjang, $user->registrationPeriod),
        ]);
    }

    public function finalize(Request $request, Admission $admission): RedirectResponse
    {
        $user = $request->user();

        if ($blocker = $admission->finalizationBlocker($user, $this->forms->isComplete($user))) {
            return back()->with('error', $blocker);
        }

        $user->forceFill([
            'status' => StatusPendaftaran::MenungguVerifikasi,
            'finalized_at' => now(),
        ])->save();
        ActivityLog::record('finalisasi', 'Mengajukan finalisasi data', $user);

        return back()->with('success', 'Data berhasil diajukan. Admin akan memeriksa datamu.');
    }

    public function card(Request $request, ExamAccounts $examAccounts, Admission $admission): Response|RedirectResponse
    {
        $user = $request->user();

        if ($blocker = $admission->cardBlocker($user)) {
            return redirect()->route('dashboard')->with('error', $blocker);
        }

        // Students verified before exam accounts and numbers existed get them here.
        $examAccounts->ensure($user);

        return Inertia::render('User/Kartu', [
            'kartu' => [
                ...$this->identity($user),
                'username' => $user->username,
                'photo_url' => $user->photoUrl(),
                'exam_username' => $user->exam_username,
                'exam_password' => $user->exam_password,
                'jadwal' => ExamSchedule::forStudent($user)->ordered()->get()->map(fn (ExamSchedule $item) => $item->present()),
                'catatan' => $admission->settings($user->jenjang)->exam_notes,
            ],
        ]);
    }

    /**
     * The printable result letter (surat keterangan hasil seleksi).
     */
    public function letter(Request $request, Admission $admission): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $admission->hasLetter($user)) {
            return redirect()->route('dashboard')->with('error', 'Surat hasil seleksi tersedia setelah hasil seleksi diumumkan.');
        }

        $settings = $admission->settings($user->jenjang);

        return Inertia::render('User/Kelulusan', [
            'surat' => [
                ...$this->identity($user),
                'lulus' => $user->status === StatusPendaftaran::Lulus,
                'daftar_ulang' => $settings->reregistration_info,
                'kepala' => $settings->headmaster_name,
                'nip' => $settings->headmaster_nip,
                'tanggal' => ($settings->announcement_at ?? now())->translatedFormat('j F Y'),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function identity(User $user): array
    {
        return [
            'nomor_pendaftaran' => $user->nomorPendaftaran(),
            'nomor_peserta' => $user->nomorPeserta(),
            'nama' => $user->name,
            'jenjang' => $user->jenjang?->label(),
            'jenjang_kode' => $user->jenjang?->value,
            'tahun' => config('ppdb.tahun'),
            'gelombang' => $user->registrationPeriod?->name,
            'asal_sekolah' => $this->forms->keyedAnswers(collect([$user]), ['nama_sekolah'])->get($user->id)['nama_sekolah'] ?? null,
        ];
    }
}
