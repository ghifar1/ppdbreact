<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * What happened in the admission, and who did it, as ppdb2020's `logs`.
 * Entries are only added, never changed.
 */
#[Fillable(['causer_id', 'subject_id', 'action', 'description', 'properties', 'ip_address'])]
class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    /**
     * Log something done by the logged-in user (or `$causer`) during this request.
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(string $action, string $description, ?User $subject = null, array $properties = [], ?User $causer = null): self
    {
        return static::create([
            'causer_id' => ($causer ?? auth()->user())?->id,
            'subject_id' => $subject?->id,
            'action' => $action,
            'description' => mb_substr($description, 0, 500),
            'properties' => $properties ?: null,
            'ip_address' => app()->runningInConsole() ? null : request()->ip(),
        ]);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function causer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'causer_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subject_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function present(): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'description' => $this->description,
            'time' => $this->created_at?->translatedFormat('j M Y, H.i'),
            'relative' => $this->created_at?->diffForHumans(),
            'causer' => $this->causer ? [
                'id' => $this->causer->id,
                'name' => $this->causer->name,
                'role' => $this->causer->isAdmin() ? 'panitia' : 'siswa',
            ] : null,
            'subject' => $this->subject && ! $this->subject->isAdmin() ? [
                'id' => $this->subject->id,
                'name' => $this->subject->name,
            ] : null,
            'ip_address' => $this->ip_address,
        ];
    }
}
