<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Jenjang;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ExamAccounts;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExamAccountController extends Controller
{
    public function __construct(private ExamAccounts $accounts) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'jenjang' => ['nullable', Rule::enum(Jenjang::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $students = $this->filtered($filters)
            ->orderByRaw('exam_username is null desc')
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (User $student) => [
                'id' => $student->id,
                'nomor_pendaftaran' => $student->nomorPendaftaran(),
                'name' => $student->name,
                'jenjang' => $student->jenjang?->shortLabel(),
                'status' => $student->status->value,
                'status_label' => $student->status->label(),
                'exam_username' => $student->exam_username,
                'exam_password' => $student->exam_password,
            ]);

        return Inertia::render('Admin/ExamAccounts/Index', [
            'students' => $students,
            'filters' => ['jenjang' => $filters['jenjang'] ?? '', 'q' => $filters['q'] ?? ''],
            'jenjangOptions' => Jenjang::options(),
            'missing' => $this->accounts->eligible()->whereNull('exam_username')->count(),
        ]);
    }

    public function generate(): RedirectResponse
    {
        $created = $this->accounts->ensureAll();

        return back()->with('success', $created > 0
            ? "{$created} akun ujian dibuat."
            : 'Semua siswa terverifikasi sudah punya akun ujian.');
    }

    public function reset(User $student): RedirectResponse
    {
        abort_if($student->isAdmin(), 404);

        if (! $student->status->hasExamCard()) {
            return back()->with('error', 'Akun ujian hanya untuk siswa yang datanya sudah diverifikasi.');
        }

        $hadAccount = $student->exam_username !== null;
        $this->accounts->resetPassword($student);

        return back()->with('success', $hadAccount
            ? "Password akun ujian {$student->name} diganti."
            : "Akun ujian {$student->name} dibuat.");
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $request->validate(['jenjang' => ['nullable', Rule::enum(Jenjang::class)]]);
        $rows = $this->accounts->exportRows(
            $this->filtered($filters)->whereNotNull('exam_username')->orderBy('id')->get(),
        );

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['no_pendaftaran', 'username', 'password', 'nama', 'jenjang', 'nisn', 'asal_sekolah', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir'], escape: '');
            foreach ($rows as $row) {
                fputcsv($handle, array_values($row), escape: '');
            }
            fclose($handle);
        }, 'akun-ujian-'.now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * @param  array<string, string|null>  $filters
     */
    private function filtered(array $filters)
    {
        return $this->accounts->eligible()
            ->when($filters['jenjang'] ?? null, fn ($query, $jenjang) => $query->where('jenjang', $jenjang))
            ->when($filters['q'] ?? null, fn ($query, $search) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('exam_username', 'like', "%{$search}%")));
    }
}
