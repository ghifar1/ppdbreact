<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\FormField;
use App\Models\Menu;
use App\Models\Payment;
use App\Models\RegistrationPeriod;
use App\Models\User;
use App\Services\Admission;
use App\Services\ExamAccounts;
use App\Services\FormService;
use App\Services\StudentExport;
use App\Support\RegistrationYears;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StudentController extends Controller
{
    public function __construct(private FormService $forms, private ExamAccounts $examAccounts) {}

    public function index(Request $request, Admission $admission): Response
    {
        $filters = $this->filters($request);
        $year = RegistrationYears::selected($filters['tahun'] ?? null);

        $students = $this->students($filters)
            ->with(['payment', 'registrationPeriod'])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $student) => [
                'id' => $student->id,
                'nomor_pendaftaran' => $student->nomorPendaftaran(),
                'name' => $student->name,
                'username' => $student->username,
                'photo_url' => $student->photoUrl(),
                'jenjang' => $student->jenjang?->shortLabel(),
                'status' => $student->status->value,
                'status_label' => $student->status->label(),
                'payment' => $admission->paymentRequired($student)
                    ? ['status' => $student->payment?->status->value ?? 'belum', 'label' => $student->payment?->status->label() ?? 'Belum bayar']
                    : null,
                'registered_at' => $student->created_at?->format('d/m/Y'),
            ]);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters' => [
                'jenjang' => $filters['jenjang'] ?? '',
                'status' => $filters['status'] ?? '',
                'q' => $filters['q'] ?? '',
                'gelombang' => (string) ($filters['gelombang'] ?? ''),
                'tahun' => $year ? (string) $year : '',
            ],
            'tahunOptions' => RegistrationYears::options(),
            'jenjangOptions' => Jenjang::options(),
            'statusOptions' => StatusPendaftaran::options(),
            'periodOptions' => RegistrationPeriod::orderByDesc('opens_at')->get()->map(fn (RegistrationPeriod $period) => [
                'value' => (string) $period->id,
                'label' => $period->name.' · '.($period->jenjang?->shortLabel() ?? 'Semua jenjang'),
            ]),
        ]);
    }

    public function show(User $student, Admission $admission): Response
    {
        $this->ensureStudent($student);

        $answers = $this->forms->answersFor($student);
        $menus = $student->jenjang
            ? Menu::forJenjang($student->jenjang)->ordered()->with('fields')->get()
            : collect();

        return Inertia::render('Admin/Students/Show', [
            'student' => [
                'id' => $student->id,
                'nomor_pendaftaran' => $student->nomorPendaftaran(),
                'name' => $student->name,
                'username' => $student->username,
                'photo_url' => $student->photoUrl(),
                'email' => $student->email,
                'no_hp' => $student->no_hp,
                'jenjang' => $student->jenjang?->label(),
                'jenjang_kode' => $student->jenjang?->value,
                'legacy_id' => $student->legacy_id,
                'gelombang' => $student->registrationPeriod?->name,
                'exam_username' => $student->exam_username,
                'exam_password' => $student->exam_password,
                'exam_eligible' => $student->status->hasExamCard(),
                'nomor_peserta' => $student->nomorPeserta(),
                'status' => $student->status->value,
                'status_label' => $student->status->label(),
                'catatan_admin' => $student->catatan_admin,
                'registered_at' => $student->created_at?->format('d/m/Y H:i'),
                'finalized_at' => $student->finalized_at?->format('d/m/Y H:i'),
            ],
            'menus' => $menus->map(fn (Menu $menu) => [
                'id' => $menu->id,
                'title' => $menu->title,
                'is_active' => $menu->is_active,
                'complete' => $this->forms->isMenuComplete($menu, $answers),
                'fields' => $menu->fields->map(fn (FormField $field) => [
                    'id' => $field->id,
                    'label' => $field->label,
                    'type' => $field->type->value,
                    'required' => $field->is_required,
                    'value' => $this->displayValue($field, $answers->get($field->id)),
                    'file' => $field->type === FieldType::File ? $this->forms->fileInfo($answers->get($field->id)) : null,
                ]),
            ]),
            'statusOptions' => StatusPendaftaran::options(),
            'activity' => ActivityLog::with(['causer', 'subject'])
                ->where(fn ($query) => $query->where('subject_id', $student->id)->orWhere('causer_id', $student->id))
                ->latest('id')->limit(15)->get()
                ->map(fn (ActivityLog $log) => $log->present()),
            'payment' => [
                'required' => $admission->paymentRequired($student),
                'fee' => $admission->fee($student),
                'fee_label' => Payment::rupiah($admission->fee($student)),
                'record' => $student->payment?->present(),
            ],
        ]);
    }

    public function updateStatus(Request $request, User $student, Admission $admission): RedirectResponse
    {
        $this->ensureStudent($student);

        $data = $request->validate([
            'status' => ['required', Rule::enum(StatusPendaftaran::class)],
            'catatan_admin' => [
                Rule::requiredIf($request->input('status') === StatusPendaftaran::PerluPerbaikan->value),
                'nullable', 'string', 'max:2000',
            ],
        ]);

        $status = StatusPendaftaran::from($data['status']);

        if ($status->hasExamCard() && ! $admission->isPaid($student)) {
            return back()->withErrors([
                'status' => "Pembayaran {$student->name} belum lunas. Konfirmasi pembayarannya dulu sebelum mengubah status menjadi {$status->label()}.",
            ]);
        }

        $from = $student->status;
        $student->forceFill([
            'status' => $status,
            'catatan_admin' => $data['catatan_admin'] ?? null,
        ])->save();

        if ($student->status->hasExamCard()) {
            $this->examAccounts->ensure($student);
        }

        if ($from !== $status || $student->wasChanged('catatan_admin')) {
            ActivityLog::record('status.ubah', "Mengubah status {$student->name} dari {$from->label()} menjadi {$status->label()}", $student, array_filter([
                'dari' => $from->value,
                'menjadi' => $status->value,
                'catatan' => $student->catatan_admin,
            ]));
        }

        return back()->with('success', "Status {$student->name} diubah menjadi {$student->status->label()}.");
    }

    public function resetPassword(Request $request, User $student): RedirectResponse
    {
        $this->ensureStudent($student);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $student->forceFill(['password' => $data['password']])->save();
        $student->payment()->update(['account_password' => null]);
        ActivityLog::record('akun.reset_password', "Mengatur ulang password {$student->name}", $student);

        return back()->with('success', "Kata sandi {$student->name} berhasil diganti.");
    }

    /**
     * The students in the list as an Excel workbook, with all their answers.
     */
    public function export(Request $request, StudentExport $export): BinaryFileResponse
    {
        $filters = $this->filters($request);
        $path = tempnam(sys_get_temp_dir(), 'ppdb-export');
        $count = $export->write($this->students($filters), $path);

        $year = RegistrationYears::selected($filters['tahun'] ?? null);
        $name = implode('-', array_filter(['data-siswa', $filters['jenjang'] ?? null, $year, now()->format('Ymd-His')])).'.xlsx';
        ActivityLog::record('data.unduh', "Mengunduh data siswa ({$count} siswa)", properties: array_filter($filters));

        return response()->download($path, $name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend();
    }

    /**
     * @return array<string, mixed>
     */
    private function filters(Request $request): array
    {
        return $request->validate([
            'jenjang' => ['nullable', Rule::enum(Jenjang::class)],
            'status' => ['nullable', Rule::enum(StatusPendaftaran::class)],
            'q' => ['nullable', 'string', 'max:100'],
            'gelombang' => ['nullable', 'integer'],
            'tahun' => ['nullable', 'string', 'max:10'],
        ]);
    }

    /**
     * Students matching the list filters.
     *
     * @param  array<string, mixed>  $filters
     * @return Builder<User>
     */
    private function students(array $filters): Builder
    {
        return User::query()
            ->where('role', User::ROLE_STUDENT)
            ->registeredIn(RegistrationYears::selected($filters['tahun'] ?? null))
            ->when($filters['jenjang'] ?? null, fn ($query, $jenjang) => $query->where('jenjang', $jenjang))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['gelombang'] ?? null, fn ($query, $period) => $query->where('registration_period_id', $period))
            ->when($filters['q'] ?? null, fn ($query, $search) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")));
    }

    private function ensureStudent(User $student): void
    {
        abort_if($student->isAdmin(), 404);
    }

    private function displayValue(FormField $field, $answer): ?string
    {
        if (! $this->forms->isFilled($answer)) {
            return null;
        }

        return match ($field->type) {
            FieldType::Checkbox => implode(', ', $this->forms->checkedOptions($answer)),
            FieldType::File => $this->forms->fileInfo($answer)['name'] ?? null,
            default => $answer->value,
        };
    }
}
