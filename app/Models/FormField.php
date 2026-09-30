<?php

namespace App\Models;

use App\Enums\FieldType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\Rule;

#[Fillable(['label', 'type', 'options', 'is_required', 'placeholder', 'help_text', 'sort_order'])]
class FormField extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => FieldType::class,
            'options' => 'array',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Menu, $this>
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * @return HasMany<FormAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(FormAnswer::class);
    }

    /**
     * Validation rules for a student's answer to this field.
     *
     * @param  bool  $hasStoredFile  Whether the student already uploaded a file for this field.
     * @return array<int, mixed>
     */
    public function rules(bool $hasStoredFile = false): array
    {
        $required = $this->is_required && ! ($this->type === FieldType::File && $hasStoredFile);
        $rules = [$required ? 'required' : 'nullable'];
        $options = $this->options ?? [];

        return array_merge($rules, match ($this->type) {
            FieldType::Text => ['string', 'max:255'],
            FieldType::Textarea => ['string', 'max:5000'],
            FieldType::Number => ['numeric'],
            FieldType::Email => ['email', 'max:255'],
            FieldType::Tel => ['string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            FieldType::Date => ['date'],
            FieldType::Select, FieldType::Radio => [Rule::in($options)],
            FieldType::Checkbox => ['array'],
            FieldType::File => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        });
    }
}
