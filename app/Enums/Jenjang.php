<?php

namespace App\Enums;

enum Jenjang: string
{
    case MI = 'mi';
    case MTs = 'mts';
    case MA = 'ma';

    public function label(): string
    {
        return match ($this) {
            self::MI => 'Madrasah Ibtidaiyah',
            self::MTs => 'Madrasah Tsanawiyah',
            self::MA => 'Madrasah Aliyah',
        };
    }

    public function shortLabel(): string
    {
        return match ($this) {
            self::MI => 'MI',
            self::MTs => 'MTs',
            self::MA => 'MA',
        };
    }

    /**
     * @return list<array{value: string, label: string, short: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $jenjang) => [
            'value' => $jenjang->value,
            'label' => $jenjang->label(),
            'short' => $jenjang->shortLabel(),
        ], self::cases());
    }
}
