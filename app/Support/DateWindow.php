<?php

namespace App\Support;

use Carbon\CarbonInterface;

/**
 * A period during which something is allowed, e.g. submitting for
 * finalization. Either bound may be missing; without both it is unlimited.
 */
final class DateWindow
{
    public const UNLIMITED = 'unlimited';

    public const UPCOMING = 'upcoming';

    public const OPEN = 'open';

    public const CLOSED = 'closed';

    public function __construct(
        public readonly ?CarbonInterface $opensAt,
        public readonly ?CarbonInterface $closesAt,
    ) {}

    public function status(?CarbonInterface $now = null): string
    {
        $now ??= now();

        return match (true) {
            $this->opensAt === null && $this->closesAt === null => self::UNLIMITED,
            $this->opensAt !== null && $now->lt($this->opensAt) => self::UPCOMING,
            $this->closesAt !== null && $now->gt($this->closesAt) => self::CLOSED,
            default => self::OPEN,
        };
    }

    public function allows(?CarbonInterface $now = null): bool
    {
        return in_array($this->status($now), [self::UNLIMITED, self::OPEN], true);
    }

    public function opensLabel(): ?string
    {
        return $this->opensAt?->translatedFormat('j F Y, H.i');
    }

    public function closesLabel(): ?string
    {
        return $this->closesAt?->translatedFormat('j F Y, H.i');
    }

    /**
     * Short label for timelines, e.g. "1 Apr – 8 Jul 2027".
     */
    public function label(): ?string
    {
        return match (true) {
            $this->opensAt !== null && $this->closesAt !== null => $this->opensAt->translatedFormat('j M Y').' – '.$this->closesAt->translatedFormat('j M Y'),
            $this->opensAt !== null => 'Mulai '.$this->opensAt->translatedFormat('j M Y'),
            $this->closesAt !== null => 'Sampai '.$this->closesAt->translatedFormat('j M Y'),
            default => null,
        };
    }

    /**
     * @return array{status: string, allowed: bool, opens_label: ?string, closes_label: ?string, label: ?string}
     */
    public function present(): array
    {
        return [
            'status' => $this->status(),
            'allowed' => $this->allows(),
            'opens_label' => $this->opensLabel(),
            'closes_label' => $this->closesLabel(),
            'label' => $this->label(),
        ];
    }
}
