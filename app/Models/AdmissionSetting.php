<?php

namespace App\Models;

use App\Enums\Jenjang;
use App\Support\DateWindow;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Fee, payment details, schedule and letter details of one jenjang, set by
 * admins under Pengaturan Seleksi. Every column is optional; an empty one
 * leaves that part of the admission flow unrestricted.
 */
#[Fillable([
    'fee', 'bank_name', 'account_number', 'account_name', 'payment_notes',
    'finalization_opens_at', 'finalization_closes_at', 'card_opens_at', 'card_closes_at', 'announcement_at',
    'exam_notes', 'reregistration_info', 'headmaster_name', 'headmaster_nip',
])]
class AdmissionSetting extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jenjang' => Jenjang::class,
            'fee' => 'integer',
            'finalization_opens_at' => 'datetime',
            'finalization_closes_at' => 'datetime',
            'card_opens_at' => 'datetime',
            'card_closes_at' => 'datetime',
            'announcement_at' => 'datetime',
        ];
    }

    /**
     * The saved settings of a jenjang, or empty (unsaved) ones.
     */
    public static function for(Jenjang $jenjang): self
    {
        return static::where('jenjang', $jenjang)->first() ?? (new static)->forceFill(['jenjang' => $jenjang]);
    }

    public function finalizationWindow(): DateWindow
    {
        return new DateWindow($this->finalization_opens_at, $this->finalization_closes_at);
    }

    public function cardWindow(): DateWindow
    {
        return new DateWindow($this->card_opens_at, $this->card_closes_at);
    }

    /**
     * Whether results set by admins may be shown to students yet.
     */
    public function resultsAnnounced(): bool
    {
        return $this->announcement_at === null || now()->gte($this->announcement_at);
    }
}
