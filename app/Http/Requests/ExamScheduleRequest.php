<?php

namespace App\Http\Requests;

use App\Enums\Jenjang;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExamScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'jenjang' => in_array($this->input('jenjang'), ['', 'semua'], true) ? null : $this->input('jenjang'),
            'registration_period_id' => in_array($this->input('registration_period_id'), ['', 'semua'], true) ? null : $this->input('registration_period_id'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'jenjang' => ['nullable', Rule::enum(Jenjang::class)],
            'registration_period_id' => ['nullable', 'integer', Rule::exists('registration_periods', 'id')],
            'date' => ['required', 'date_format:Y-m-d'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['nullable', 'date_format:H:i', 'after:starts_at'],
            'location' => ['nullable', 'string', 'max:150'],
            'number_from' => ['nullable', 'required_with:number_to', 'integer', 'min:1', 'max:65000'],
            'number_to' => ['nullable', 'required_with:number_from', 'integer', 'gte:number_from', 'max:65000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'nama kegiatan',
            'registration_period_id' => 'gelombang',
            'date' => 'tanggal',
            'starts_at' => 'jam mulai',
            'ends_at' => 'jam selesai',
            'location' => 'tempat',
            'number_from' => 'nomor peserta awal',
            'number_to' => 'nomor peserta akhir',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'number_to.gte' => 'Nomor peserta akhir tidak boleh lebih kecil dari nomor awal.',
            'ends_at.after' => 'Jam selesai harus setelah jam mulai.',
        ];
    }

    /**
     * The validated values, with optional fields left out of the request cleared.
     *
     * @return array<string, mixed>
     */
    public function scheduleData(): array
    {
        return $this->validated() + array_fill_keys(
            ['description', 'jenjang', 'registration_period_id', 'ends_at', 'location', 'number_from', 'number_to'],
            null,
        );
    }
}
