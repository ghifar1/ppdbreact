<?php

namespace App\Services;

use App\Enums\Jenjang;
use App\Models\RegistrationPeriod;
use Illuminate\Support\Collection;

/**
 * Whether students can register right now.
 *
 * A jenjang without any registration period is always open, so schools that
 * do not use periods are unaffected. Once a jenjang has periods (its own or
 * ones for every jenjang), registration is only open while one of them is.
 */
final class RegistrationSchedule
{
    /** @var Collection<int, RegistrationPeriod>|null */
    private ?Collection $periods = null;

    /**
     * @return array{open: bool, restricted: bool, current: ?RegistrationPeriod, next: ?RegistrationPeriod}
     */
    public function for(Jenjang $jenjang): array
    {
        $now = now();
        $periods = $this->periods()->filter(fn (RegistrationPeriod $period) => $period->appliesTo($jenjang));
        $current = $periods->filter(fn (RegistrationPeriod $period) => $period->isOpen($now))->sortBy('closes_at')->first();

        return [
            'open' => $periods->isEmpty() || $current !== null,
            'restricted' => $periods->isNotEmpty(),
            'current' => $current,
            'next' => $periods->first(fn (RegistrationPeriod $period) => $period->opens_at->isAfter($now)),
        ];
    }

    /**
     * The period a student registering now for this jenjang belongs to.
     */
    public function currentPeriod(Jenjang $jenjang): ?RegistrationPeriod
    {
        return $this->for($jenjang)['current'];
    }

    /**
     * Status of every jenjang plus the periods worth showing on public pages:
     * open, upcoming, and those closed in the last 30 days.
     *
     * @return array<string, mixed>
     */
    public function summary(): array
    {
        $jenjang = collect(Jenjang::cases())->mapWithKeys(function (Jenjang $jenjang) {
            $status = $this->for($jenjang);

            return [$jenjang->value => [
                'open' => $status['open'],
                'restricted' => $status['restricted'],
                'current' => $status['current']?->present(),
                'next' => $status['next']?->present(),
            ]];
        });

        return [
            'jenjang' => $jenjang,
            'restricted' => $jenjang->contains('restricted', true),
            'anyOpen' => $jenjang->contains(fn (array $status) => $status['restricted'] && $status['open']),
            'periods' => $this->periods()
                ->filter(fn (RegistrationPeriod $period) => $period->closes_at->gte(now()->subDays(30)))
                ->map(fn (RegistrationPeriod $period) => $period->present())
                ->values(),
        ];
    }

    /**
     * @return Collection<int, RegistrationPeriod>
     */
    private function periods(): Collection
    {
        return $this->periods ??= RegistrationPeriod::orderBy('opens_at')->get();
    }
}
