<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use App\Http\Controllers\Controller;
use App\Models\FormField;
use App\Models\Menu;
use App\Models\User;
use App\Services\FormService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function __construct(private FormService $forms) {}

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'jenjang' => ['nullable', Rule::enum(Jenjang::class)],
            'status' => ['nullable', Rule::enum(StatusPendaftaran::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $students = User::query()
            ->where('role', User::ROLE_STUDENT)
            ->when($filters['jenjang'] ?? null, fn ($query, $jenjang) => $query->where('jenjang', $jenjang))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['q'] ?? null, fn ($query, $search) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $student) => [
                'id' => $student->id,
                'nomor_pendaftaran' => $student->nomorPendaftaran(),
                'name' => $student->name,
                'username' => $student->username,
                'jenjang' => $student->jenjang?->shortLabel(),
                'status' => $student->status->value,
                'status_label' => $student->status->label(),
                'registered_at' => $student->created_at?->format('d/m/Y'),
            ]);

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters' => [
                'jenjang' => $filters['jenjang'] ?? '',
                'status' => $filters['status'] ?? '',
                'q' => $filters['q'] ?? '',
            ],
            'jenjangOptions' => Jenjang::options(),
            'statusOptions' => StatusPendaftaran::options(),
        ]);
    }

    public function show(User $student): Response
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
                'no_hp' => $student->no_hp,
                'jenjang' => $student->jenjang?->label(),
                'jenjang_kode' => $student->jenjang?->value,
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
        ]);
    }

    public function updateStatus(Request $request, User $student): RedirectResponse
    {
        $this->ensureStudent($student);

        $data = $request->validate([
            'status' => ['required', Rule::enum(StatusPendaftaran::class)],
            'catatan_admin' => [
                Rule::requiredIf($request->input('status') === StatusPendaftaran::PerluPerbaikan->value),
                'nullable', 'string', 'max:2000',
            ],
        ]);

        $student->forceFill([
            'status' => $data['status'],
            'catatan_admin' => $data['catatan_admin'] ?? null,
        ])->save();

        return back()->with('success', "Status {$student->name} diubah menjadi {$student->status->label()}.");
    }

    public function resetPassword(Request $request, User $student): RedirectResponse
    {
        $this->ensureStudent($student);

        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $student->forceFill(['password' => $data['password']])->save();

        return back()->with('success', "Kata sandi {$student->name} berhasil diganti.");
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
