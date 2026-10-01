<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdmissionSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    protected function prepareForValidation(): void
    {
        // "250.000" or "Rp 250.000" as typed in the form.
        if (is_string($this->input('fee'))) {
            $digits = preg_replace('/\D/', '', $this->input('fee'));
            $this->merge(['fee' => $digits === '' ? null : $digits]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'fee' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'account_name' => ['nullable', 'string', 'max:150'],
            'payment_notes' => ['nullable', 'string', 'max:2000'],
            'finalization_opens_at' => ['nullable', 'date'],
            'finalization_closes_at' => ['nullable', 'date', Rule::when($this->filled('finalization_opens_at'), 'after:finalization_opens_at')],
            'card_opens_at' => ['nullable', 'date'],
            'card_closes_at' => ['nullable', 'date', Rule::when($this->filled('card_opens_at'), 'after:card_opens_at')],
            'announcement_at' => ['nullable', 'date'],
            'exam_notes' => ['nullable', 'string', 'max:2000'],
            'reregistration_info' => ['nullable', 'string', 'max:5000'],
            'headmaster_name' => ['nullable', 'string', 'max:150'],
            'headmaster_nip' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'fee' => 'biaya pendaftaran',
            'bank_name' => 'nama bank',
            'account_number' => 'nomor rekening',
            'account_name' => 'nama pemilik rekening',
            'payment_notes' => 'keterangan pembayaran',
            'finalization_opens_at' => 'finalisasi dibuka',
            'finalization_closes_at' => 'finalisasi ditutup',
            'card_opens_at' => 'kartu ujian dibuka',
            'card_closes_at' => 'kartu ujian ditutup',
            'announcement_at' => 'waktu pengumuman',
            'exam_notes' => 'catatan kartu ujian',
            'reregistration_info' => 'informasi daftar ulang',
            'headmaster_name' => 'nama kepala madrasah',
            'headmaster_nip' => 'NIP',
        ];
    }
}
