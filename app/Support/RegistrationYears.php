<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Registration years to filter admin lists by, as ppdb2020 counted each
 * year's applicants separately.
 */
final class RegistrationYears
{
    public const ALL = 'semua';

    /**
     * Every year from the first to the last registration, and the current
     * year, newest first.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        $students = User::where('role', User::ROLE_STUDENT);
        $first = $students->clone()->min('created_at');
        $last = $students->clone()->max('created_at');
        $current = (int) now()->format('Y');

        $years = $first
            ? range(min((int) Carbon::parse($first)->format('Y'), $current), max((int) Carbon::parse($last)->format('Y'), $current))
            : [$current];

        return array_map(fn (int $year) => ['value' => (string) $year, 'label' => (string) $year], array_reverse($years));
    }

    /**
     * The year chosen in a filter: null for all years. Without a choice,
     * `$default` applies.
     */
    public static function selected(?string $value, ?int $default = null): ?int
    {
        return match (true) {
            $value === self::ALL => null,
            $value !== null && preg_match('/^\d{4}$/', $value) === 1 => (int) $value,
            default => $default,
        };
    }
}
