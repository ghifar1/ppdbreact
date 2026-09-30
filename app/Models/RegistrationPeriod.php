<?php

namespace App\Models;

use App\Enums\Jenjang;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A registration wave (gelombang pendaftaran). Students can only register
 * while a period for their jenjang is open; see RegistrationSchedule.
 */
#[Fillable(['name', 'jenjang', 'opens_at', 'closes_at', 'description'])]
class RegistrationPeriod extends Model
{
    public const UPCOMING = 'upcoming';

    public const OPEN = 'open';

    public const CLOSED = 'closed';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jenjang' => Jenjang::class,
            'opens_at' => 'datetime',
            'closes_at' => 'datetime',
        ];
    }

    /**
     * @return HasMany<User, $this>
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Periods for this jenjang, including those for every jenjang.
     */
    public function scopeForJenjang(Builder $query, Jenjang $jenjang): void
    {
        $query->where(fn (Builder $query) => $query->whereNull('jenjang')->orWhere('jenjang', $jenjang));
    }

    public function appliesTo(Jenjang $jenjang): bool
    {
        return $this->jenjang === null || $this->jenjang === $jenjang;
    }

    public function status(?CarbonInterface $now = null): string
    {
        $now ??= now();

        return match (true) {
            $now->lt($this->opens_at) => self::UPCOMING,
            $now->gt($this->closes_at) => self::CLOSED,
            default => self::OPEN,
        };
    }

    public function isOpen(?CarbonInterface $now = null): bool
    {
        return $this->status($now) === self::OPEN;
    }

    /**
     * @return array<string, mixed>
     */
    public function present(): array
    {
        $now = now();
        $status = $this->status($now);
        $until = fn (CarbonInterface $date) => $date->diffForHumans($now, CarbonInterface::DIFF_ABSOLUTE, false, 2);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'jenjang' => $this->jenjang?->value,
            'jenjang_label' => $this->jenjang?->shortLabel() ?? 'Semua jenjang',
            'opens_at' => $this->opens_at->format('Y-m-d\TH:i'),
            'closes_at' => $this->closes_at->format('Y-m-d\TH:i'),
            'opens_label' => $this->opens_at->translatedFormat('j F Y, H.i'),
            'closes_label' => $this->closes_at->translatedFormat('j F Y, H.i'),
            'range_label' => $this->opens_at->translatedFormat('j M Y').' – '.$this->closes_at->translatedFormat('j M Y'),
            'status' => $status,
            'status_label' => [self::UPCOMING => 'Belum dibuka', self::OPEN => 'Dibuka', self::CLOSED => 'Ditutup'][$status],
            'relative' => match ($status) {
                self::UPCOMING => 'Dibuka '.$until($this->opens_at).' lagi',
                self::OPEN => 'Ditutup '.$until($this->closes_at).' lagi',
                self::CLOSED => 'Ditutup '.$this->closes_at->diffForHumans($now),
            },
            'description' => $this->description,
        ];
    }
}
