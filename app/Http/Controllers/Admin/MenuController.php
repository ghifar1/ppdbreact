<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Http\Controllers\Controller;
use App\Models\FormField;
use App\Models\Menu;
use App\Services\FormService;
use App\Support\Reorder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(Request $request): Response
    {
        $jenjang = Jenjang::tryFrom((string) $request->query('jenjang')) ?? Jenjang::MI;

        return Inertia::render('Admin/Menus/Index', [
            'jenjang' => $jenjang->value,
            'jenjangOptions' => Jenjang::options(),
            'menus' => Menu::forJenjang($jenjang)->ordered()->withCount('fields')->get()
                ->map(fn (Menu $menu) => [
                    'id' => $menu->id,
                    'title' => $menu->title,
                    'is_active' => $menu->is_active,
                    'fields_count' => $menu->fields_count,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'jenjang' => ['required', Rule::enum(Jenjang::class)],
            'title' => ['required', 'string', 'max:255'],
        ]);

        $menu = Menu::create($data + [
            'sort_order' => (int) Menu::where('jenjang', $data['jenjang'])->max('sort_order') + 1,
        ]);

        return redirect()->route('admin.menus.edit', $menu)
            ->with('success', "Menu \"{$menu->title}\" dibuat. Sekarang tambahkan isian formulirnya.");
    }

    public function edit(Menu $menu): Response
    {
        return Inertia::render('Admin/Menus/Edit', [
            'menu' => [
                'id' => $menu->id,
                'title' => $menu->title,
                'description' => $menu->description,
                'is_active' => $menu->is_active,
                'jenjang' => $menu->jenjang->value,
                'jenjang_label' => $menu->jenjang->label(),
            ],
            'fields' => $menu->fields()->withCount('answers')->get()->map(fn (FormField $field) => [
                'id' => $field->id,
                'label' => $field->label,
                'type' => $field->type->value,
                'type_label' => $field->type->label(),
                'options' => $field->options ?? [],
                'is_required' => $field->is_required,
                'placeholder' => $field->placeholder,
                'help_text' => $field->help_text,
                'answers_count' => $field->answers_count,
            ]),
            'fieldTypes' => FieldType::options(),
        ]);
    }

    public function update(Request $request, Menu $menu): RedirectResponse
    {
        $menu->update($request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
        ]));

        $message = $menu->wasChanged('is_active') && ! $menu->wasChanged('title')
            ? ($menu->is_active ? "Menu \"{$menu->title}\" ditampilkan ke siswa." : "Menu \"{$menu->title}\" disembunyikan dari siswa.")
            : 'Menu disimpan.';

        return back()->with('success', $message);
    }

    public function destroy(Menu $menu, FormService $forms): RedirectResponse
    {
        $menu->fields()->where('type', FieldType::File)->with('answers')->get()
            ->each(fn (FormField $field) => $field->answers->each(fn ($answer) => $forms->deleteFile($answer)));

        $menu->delete();

        return redirect()->route('admin.menus.index', ['jenjang' => $menu->jenjang->value])
            ->with('success', "Menu \"{$menu->title}\" dihapus.");
    }

    public function move(Request $request, Menu $menu): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]])['direction'];

        Reorder::move(Menu::forJenjang($menu->jenjang)->ordered()->get(), $menu, $direction);

        return back();
    }
}
