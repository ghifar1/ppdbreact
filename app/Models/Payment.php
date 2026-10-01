<?php

namespace App\Models;

use App\Enums\Jenjang;
use App\Enums\PaymentStatus;
use App\Support\ReadableCode;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A registration fee payment. Applicants upload a transfer proof on the
 * registration page before they have an account (user_id is then null and
 * the applicant's details are kept here); the committee checks it and
 * creates the account. Admins can also record payments made at the school.
 */
#[Fillable([
    'amount', 'method', 'status', 'proof_path', 'proof_name', 'sender_name', 'note', 'submitted_at', 'reviewed_by', 'reviewed_at',
    'jenjang', 'registration_period_id', 'applicant_name', 'phone', 'email', 'account_password',
])]
#[Hidden(['account_password'])]
class Payment extends Model
{
    public const METHOD_TRANSFER = 'transfer';

    public const METHOD_CASH = 'tunai';

    public const METHOD_IMPORT = 'impor';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PaymentStatus::class,
            'amount' => 'integer',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'jenjang' => Jenjang::class,
            'account_password' => 'encrypted',
        ];
    }

    /**
     * A new applicant's payment with a fresh tracking code.
     */
    public static function newApplicant(): self
    {
        do {
            $code = ReadableCode::generate(10);
        } while (static::where('code', $code)->exists());

        return (new static)->forceFill(['code' => $code]);
    }

    /**
     * The tracking code as applicants see it, e.g. "ABCDE-FGHJK".
     */
    public function codeLabel(): ?string
    {
        return $this->code ? implode('-', str_split($this->code, 5)) : null;
    }

    /**
     * Whether this is an applicant still waiting for an account.
     */
    public function isApplicant(): bool
    {
        return $this->user_id === null;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @return BelongsTo<RegistrationPeriod, $this>
     */
    public function registrationPeriod(): BelongsTo
    {
        return $this->belongsTo(RegistrationPeriod::class);
    }

    public function methodLabel(): string
    {
        return match ($this->method) {
            self::METHOD_CASH => 'Tunai di sekolah',
            self::METHOD_IMPORT => 'Data ppdb2020',
            default => 'Transfer',
        };
    }

    public static function rupiah(?int $amount): ?string
    {
        return $amount === null ? null : 'Rp '.number_format($amount, 0, ',', '.');
    }

    /**
     * @return array<string, mixed>
     */
    public function present(): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'amount_label' => self::rupiah($this->amount),
            'method' => $this->method,
            'method_label' => $this->methodLabel(),
            'code' => $this->codeLabel(),
            'applicant' => $this->isApplicant() ? [
                'name' => $this->applicant_name,
                'phone' => $this->phone,
                'email' => $this->email,
                'jenjang' => $this->jenjang?->value,
                'jenjang_label' => $this->jenjang?->shortLabel(),
                'gelombang' => $this->registrationPeriod?->name,
            ] : null,
            'sender_name' => $this->sender_name,
            'note' => $this->note,
            'proof' => $this->proof_path ? [
                'name' => $this->proof_name ?? basename($this->proof_path),
                'url' => route('payments.proof', $this),
                'is_image' => (bool) preg_match('/\.(jpe?g|png)$/i', $this->proof_path),
            ] : null,
            'submitted_at' => $this->submitted_at?->translatedFormat('j M Y, H.i'),
            'reviewed_at' => $this->reviewed_at?->translatedFormat('j M Y, H.i'),
            'reviewer' => $this->reviewer?->name,
        ];
    }
}
