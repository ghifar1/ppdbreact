<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A student's registration fee payment: a transfer with an uploaded proof,
 * or a cash payment recorded by an admin.
 */
#[Fillable(['amount', 'method', 'status', 'proof_path', 'proof_name', 'sender_name', 'note', 'submitted_at', 'reviewed_by', 'reviewed_at'])]
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
        ];
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
