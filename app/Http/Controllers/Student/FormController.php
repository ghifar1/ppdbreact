<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
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

        return back()->with('success', "{$menu->title} berhasil disimpan.");
    }

    /**
     * Students may only open active menus of their own jenjang.
     */
    private function ensureAvailable(Request $request, Menu $menu): void
    {
        abort_unless($menu->is_active && $menu->jenjang === $request->user()->jenjang, 404);
    }
}
