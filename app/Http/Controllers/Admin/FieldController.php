<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FieldType;
use App\Http\Controllers\Controller;
use App\Http\Requests\FieldRequest;
use App\Models\ActivityLog;
use App\Models\FormField;
use App\Models\Menu;
use App\Services\FormService;
use App\Support\Reorder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FieldController extends Controller
{
    public function store(FieldRequest $request, Menu $menu): RedirectResponse
    {
        $field = $menu->fields()->create($request->fieldData() + [
            'sort_order' => (int) $menu->fields()->max('sort_order') + 1,
        ]);
        ActivityLog::record('isian.buat', "Menambah isian \"{$field->label}\" di menu {$menu->title} ({$menu->jenjang->shortLabel()})");

        return back()->with('success', 'Isian ditambahkan.');
    }

    public function update(FieldRequest $request, FormField $field, FormService $forms): RedirectResponse
    {
        $data = $request->fieldData();

        // File and checkbox answers are stored as JSON, so existing answers
        // cannot be carried over when switching to or from those types.
        $structured = fn (FieldType $type) => in_array($type, [FieldType::File, FieldType::Checkbox], true);

        if ($field->type !== $data['type'] && ($structured($field->type) || $structured($data['type']))) {
            if ($field->type === FieldType::File) {
                $field->answers->each(fn ($answer) => $forms->deleteFile($answer));
            }

            $field->answers()->delete();
        }

        $field->update($data);
        ActivityLog::record('isian.ubah', "Mengubah isian \"{$field->label}\" di menu {$field->menu->title} ({$field->menu->jenjang->shortLabel()})");

        return back()->with('success', 'Isian disimpan.');
    }

    public function destroy(FormField $field, FormService $forms): RedirectResponse
    {
        if ($field->type === FieldType::File) {
            $field->answers->each(fn ($answer) => $forms->deleteFile($answer));
        }

        $field->delete();
        ActivityLog::record('isian.hapus', "Menghapus isian \"{$field->label}\" dari menu {$field->menu->title} ({$field->menu->jenjang->shortLabel()})");

        return back()->with('success', "Isian \"{$field->label}\" dihapus.");
    }

    public function move(Request $request, FormField $field): RedirectResponse
    {
        $direction = $request->validate(['direction' => ['required', Rule::in(['up', 'down'])]])['direction'];

        Reorder::move($field->menu->fields, $field, $direction);

        return back();
    }
}
