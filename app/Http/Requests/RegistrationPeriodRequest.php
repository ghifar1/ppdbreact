<?php

namespace App\Http\Requests;

use App\Enums\Jenjang;
use App\Models\RegistrationPeriod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class RegistrationPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        if (in_array($this->input('jenjang'), ['', 'semua'], true)) {
            $this->merge(['jenjang' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'jenjang' => ['nullable', Rule::enum(Jenjang::class)],
            'opens_at' => ['required', 'date'],
            'closes_at' => ['required', 'date', 'after:opens_at'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return ['name' => 'nama gelombang'];
    }

    /**
     * Two periods for the same jenjang may not overlap, otherwise a student
     * registering in the overlap would belong to both.
     */
    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $jenjang = $this->input('jenjang');
            $overlap = RegistrationPeriod::query()
                ->when($this->route('period'), fn ($query, RegistrationPeriod $period) => $query->whereKeyNot($period->id))
                ->when($jenjang, fn ($query) => $query->where(fn ($query) => $query->whereNull('jenjang')->orWhere('jenjang', $jenjang)))
                ->where('opens_at', '<', Carbon::parse($this->input('closes_at')))
                ->where('closes_at', '>', Carbon::parse($this->input('opens_at')))
                ->first();

            if ($overlap) {
                $scope = $overlap->jenjang?->shortLabel() ?? 'semua jenjang';
                $validator->errors()->add('opens_at', "Waktunya bertabrakan dengan {$overlap->name} ({$scope}, {$overlap->present()['range_label']}).");
            }
        }];
    }

    /**
     * @return array<string, mixed>
     */
    public function periodData(): array
    {
        return $this->safe()->only(['name', 'jenjang', 'opens_at', 'closes_at', 'description']);
    }
}
