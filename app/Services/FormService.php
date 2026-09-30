<?php

namespace App\Services;

use App\Enums\FieldType;
use App\Models\FormAnswer;
use App\Models\FormField;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class FormService
{
    /**
     * Active menus (with their fields) the student has to fill in.
     *
     * @return Collection<int, Menu>
     */
    public function menusFor(User $user): Collection
    {
        if (! $user->jenjang) {
            return collect();
        }

        return Menu::forJenjang($user->jenjang)->active()->ordered()->with('fields')->get();
    }

    /**
     * The student's answers keyed by field id.
     *
     * @return Collection<int, FormAnswer>
     */
    public function answersFor(User $user): Collection
    {
        return $user->answers()->get()->keyBy('form_field_id');
    }

    public function isFilled(?FormAnswer $answer): bool
    {
        $value = $answer?->value;

        return $value !== null && $value !== '' && $value !== '[]';
    }

    /**
     * @param  Collection<int, FormAnswer>  $answers
     */
    public function isMenuComplete(Menu $menu, Collection $answers): bool
    {
        return $menu->fields
            ->filter(fn (FormField $field) => $field->is_required)
            ->every(fn (FormField $field) => $this->isFilled($answers->get($field->id)));
    }

    /**
     * Sidebar entries for the student: every active menu and whether it is complete.
     *
     * @return list<array{id: int, title: string, complete: bool}>
     */
    public function progress(User $user): array
    {
        $answers = $this->answersFor($user);

        return $this->menusFor($user)->map(fn (Menu $menu) => [
            'id' => $menu->id,
            'title' => $menu->title,
            'complete' => $this->isMenuComplete($menu, $answers),
        ])->values()->all();
    }

    public function isComplete(User $user): bool
    {
        $progress = $this->progress($user);

        return $progress !== [] && collect($progress)->every(fn (array $menu) => $menu['complete']);
    }

    /**
     * Validation rules for submitting one menu's form.
     *
     * @param  Collection<int, FormAnswer>  $answers
     * @return array<string, array<int, mixed>>
     */
    public function rulesFor(Menu $menu, Collection $answers): array
    {
        $rules = [];

        foreach ($menu->fields as $field) {
            $hasStoredFile = $field->type === FieldType::File && $this->isFilled($answers->get($field->id));
            $rules["answers.{$field->id}"] = $field->rules($hasStoredFile);

            if ($field->type === FieldType::Checkbox) {
                $rules["answers.{$field->id}.*"] = [Rule::in($field->options ?? [])];
            }
        }

        return $rules;
    }

    /**
     * Human-readable attribute names so validation messages show the field labels.
     *
     * @return array<string, string>
     */
    public function attributesFor(Menu $menu): array
    {
        return $menu->fields->mapWithKeys(fn (FormField $field) => [
            "answers.{$field->id}" => $field->label,
            "answers.{$field->id}.*" => $field->label,
        ])->all();
    }

    /**
     * Store the submitted answers for one menu.
     *
     * @param  array<int|string, mixed>  $input
     * @param  Collection<int, FormAnswer>  $answers
     */
    public function save(User $user, Menu $menu, array $input, Collection $answers): void
    {
        foreach ($menu->fields as $field) {
            $value = $input[$field->id] ?? null;
            $existing = $answers->get($field->id);

            if ($field->type === FieldType::File) {
                if (! $value instanceof UploadedFile) {
                    continue; // keep the previously uploaded file
                }

                $this->deleteFile($existing);
                $value = json_encode([
                    'path' => $value->store("ppdb/{$user->id}", 'local'),
                    'name' => $value->getClientOriginalName(),
                ]);
            } elseif ($field->type === FieldType::Checkbox) {
                $value = json_encode(array_values((array) ($value ?? [])));
            } elseif ($value !== null) {
                $value = (string) $value;
            }

            FormAnswer::updateOrCreate(
                ['user_id' => $user->id, 'form_field_id' => $field->id],
                ['value' => $value],
            );
        }
    }

    /**
     * The answer in the shape the React form expects.
     */
    public function formValue(FormField $field, ?FormAnswer $answer): mixed
    {
        return match ($field->type) {
            FieldType::Checkbox => $this->checkedOptions($answer),
            FieldType::File => $this->fileInfo($answer),
            default => $answer?->value ?? '',
        };
    }

    /**
     * @return list<string>
     */
    public function checkedOptions(?FormAnswer $answer): array
    {
        $checked = $this->isFilled($answer) ? json_decode($answer->value, true) : [];

        return is_array($checked) ? array_values($checked) : [];
    }

    /**
     * @return array{name: string, url: string}|null
     */
    public function fileInfo(?FormAnswer $answer): ?array
    {
        if (! $this->isFilled($answer)) {
            return null;
        }

        $file = json_decode($answer->value, true);

        if (! is_array($file) || empty($file['path'])) {
            return null;
        }

        return [
            'name' => $file['name'] ?? basename($file['path']),
            'url' => route('answers.file', $answer),
        ];
    }

    public function deleteFile(?FormAnswer $answer): void
    {
        if (! $this->isFilled($answer)) {
            return;
        }

        $file = json_decode($answer->value, true);
        $path = is_array($file) ? ($file['path'] ?? null) : null;

        if ($path) {
            Storage::disk('local')->delete($path);
        }
    }
}
