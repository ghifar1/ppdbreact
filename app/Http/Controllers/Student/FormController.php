<?php

namespace App\Http\Controllers\Student;

use App\Enums\FieldType;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\Menu;
use App\Services\FormService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends Controller
{
    public function __construct(private FormService $forms) {}

    public function show(Request $request, Menu $menu): Response
    {
        $this->ensureAvailable($request, $menu);

        $answers = $this->forms->answersFor($request->user());

        return Inertia::render('User/Form', [
            'menu' => $menu->only('id', 'title', 'description'),
            'fields' => $menu->fields->map(fn (FormField $field) => [
                'id' => $field->id,
                'label' => $field->label,
                'type' => $field->type->value,
                'options' => $field->options ?? [],
                'required' => $field->is_required,
                'placeholder' => $field->placeholder,
                'help' => $field->help_text,
            ]),
            'values' => $menu->fields->mapWithKeys(fn (FormField $field) => [
                $field->id => $this->forms->formValue($field, $answers->get($field->id)),
            ]),
            'canEdit' => $request->user()->status->canEdit(),
        ]);
    }

    public function update(Request $request, Menu $menu): RedirectResponse
    {
        $this->ensureAvailable($request, $menu);
        $user = $request->user();

        if (! $user->status->canEdit()) {
            return back()->with('error', 'Data sudah diajukan dan tidak dapat diubah.');
        }

        $answers = $this->forms->answersFor($user);

        $validated = Validator::make(
            $request->all(),
            $this->forms->rulesFor($menu, $answers),
            [],
            $this->forms->attributesFor($menu),
        )->validate();

        $this->forms->save($user, $menu, $validated['answers'] ?? [], $answers);
        ActivityLog::record('formulir.simpan', "Menyimpan formulir {$menu->title}", $user);

        return back()->with('success', "{$menu->title} berhasil disimpan.");
    }

    /**
     * Remove an uploaded file from an optional file field.
     */
    public function destroyFile(Request $request, Menu $menu, FormField $field): RedirectResponse
    {
        $this->ensureAvailable($request, $menu);
        $user = $request->user();

        abort_unless($field->menu_id === $menu->id && $field->type === FieldType::File, 404);

        if (! $user->status->canEdit()) {
            return back()->with('error', 'Data sudah diajukan dan tidak dapat diubah.');
        }

        if ($field->is_required) {
            return back()->with('error', "{$field->label} wajib diisi. Unggah berkas pengganti untuk mengubahnya.");
        }

        $answer = FormAnswer::where('user_id', $user->id)->where('form_field_id', $field->id)->first();
        $this->forms->deleteFile($answer);
        $answer?->update(['value' => null]);
        ActivityLog::record('berkas.hapus', "Menghapus berkas {$field->label} di {$menu->title}", $user);

        return back()->with('success', "Berkas {$field->label} dihapus.");
    }

    /**
     * Students may only open active menus of their own jenjang.
     */
    private function ensureAvailable(Request $request, Menu $menu): void
    {
        abort_unless($menu->is_active && $menu->jenjang === $request->user()->jenjang, 404);
    }
}
