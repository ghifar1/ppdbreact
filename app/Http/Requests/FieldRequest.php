<?php

namespace App\Http\Requests;

use App\Enums\FieldType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FieldRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * Accept options as a list or as text with one option per line, then
     * trim them and drop blank or duplicate ones before validating.
     */
    protected function prepareForValidation(): void
    {
        $options = $this->input('options', []);

        if (is_string($options)) {
            $options = preg_split('/\r\n|\r|\n/', $options);
        }

        $options = collect((array) $options)
            ->map(fn ($option) => trim((string) $option))
            ->filter(fn (string $option) => $option !== '')
            ->unique()
            ->values()
            ->all();

        $this->merge(['options' => $options]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $hasOptions = FieldType::tryFrom((string) $this->input('type'))?->hasOptions() ?? false;

        return [
            'label' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(FieldType::class)],
            'options' => $hasOptions ? ['required', 'array', 'min:1'] : ['array'],
            'options.*' => ['string', 'max:255'],
            'is_required' => ['boolean'],
            'placeholder' => ['nullable', 'string', 'max:255'],
            'help_text' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * The validated data ready to be stored on a FormField.
     *
     * @return array<string, mixed>
     */
    public function fieldData(): array
    {
        $data = $this->validated();
        $type = FieldType::from($data['type']);

        return [
            'label' => $data['label'],
            'type' => $type,
            'options' => $type->hasOptions() ? $data['options'] : null,
            'is_required' => (bool) ($data['is_required'] ?? false),
            'placeholder' => $data['placeholder'] ?? null,
            'help_text' => $data['help_text'] ?? null,
        ];
    }
}
