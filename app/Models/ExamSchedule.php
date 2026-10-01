<?php

namespace App\Models;

use App\Enums\Jenjang;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One exam activity (e.g. a written test or an interview) printed on the
 * exam card. It can be limited to a jenjang, a registration period and a
 * range of participant numbers, which is how sessions and rooms are split.
 */
#[Fillable(['jenjang', 'registration_period_id', 'title', 'description', 'date', 'starts_at', 'ends_at', 'location', 'number_from', 'number_to'])]
class ExamSchedule extends Model
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
            'date' => 'date',
            'number_from' => 'integer',
            'number_to' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<RegistrationPeriod, $this>
     */
    public function registrationPeriod(): BelongsTo
    {
        return $this->belongsTo(RegistrationPeriod::class);
    }

    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('date')->orderBy('starts_at')->orderBy('number_from');
    }

    /**
     * Items for this jenjang and period, including those for every jenjang or period.
     */
    public function scopeApplicable(Builder $query, ?Jenjang $jenjang, ?int $periodId): void
    {
        $query->where(fn (Builder $query) => $query->whereNull('jenjang')
            ->when($jenjang, fn (Builder $query) => $query->orWhere('jenjang', $jenjang)))
            ->where(fn (Builder $query) => $query->whereNull('registration_period_id')
                ->when($periodId, fn (Builder $query) => $query->orWhere('registration_period_id', $periodId)));
    }

    /**
     * The items on a student's exam card.
     */
    public function scopeForStudent(Builder $query, User $user): void
    {
        $query->applicable($user->jenjang, $user->registration_period_id)
            ->where(fn (Builder $query) => $query->whereNull('number_from')
                ->when($user->exam_number, fn (Builder $query, int $number) => $query
                    ->orWhere(fn (Builder $query) => $query->where('number_from', '<=', $number)->where('number_to', '>=', $number))));
    }

    public function timeLabel(): string
    {
        return str_replace(':', '.', $this->starts_at).' – '.($this->ends_at ? str_replace(':', '.', $this->ends_at) : 'selesai');
    }

    public function rangeLabel(): ?string
    {
        return $this->number_from !== null ? sprintf('No. peserta %03d – %03d', $this->number_from, $this->number_to) : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function present(): array
    {
        return [
            'id' => $this->id,
            'jenjang' => $this->jenjang?->value,
            'jenjang_label' => $this->jenjang?->shortLabel() ?? 'Semua jenjang',
            'registration_period_id' => $this->registration_period_id,
            'period_label' => $this->registrationPeriod?->name,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->date->format('Y-m-d'),
            'date_label' => $this->date->translatedFormat('l, j F Y'),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'time_label' => $this->timeLabel(),
            'location' => $this->location,
            'number_from' => $this->number_from,
            'number_to' => $this->number_to,
            'range_label' => $this->rangeLabel(),
        ];
    }
}
