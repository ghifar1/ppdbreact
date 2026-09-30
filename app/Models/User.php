<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Jenjang;
use App\Enums\StatusPendaftaran;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'username', 'email', 'password', 'jenjang', 'no_hp'])]
#[Hidden(['password', 'remember_token', 'exam_password'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_STUDENT = 'student';

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => self::ROLE_STUDENT,
        'status' => 'pengisian_data',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'jenjang' => Jenjang::class,
            'status' => StatusPendaftaran::class,
            'finalized_at' => 'datetime',
            'exam_password' => 'encrypted',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * The path this user lands on after logging in.
     */
    public function homePath(): string
    {
        return $this->isAdmin() ? '/admin' : '/dashboard';
    }

    /**
     * Registration number printed on the exam card, e.g. MTS-2026-00012.
     * Students imported from ppdb2020 keep the number they had there.
     */
    public function nomorPendaftaran(): string
    {
        return $this->nomor_pendaftaran ?? sprintf(
            '%s-%s-%05d',
            strtoupper($this->jenjang?->value ?? 'X'),
            $this->created_at?->format('Y') ?? date('Y'),
            $this->id,
        );
    }

    /**
     * @return HasMany<FormAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(FormAnswer::class);
    }

    /**
     * @return BelongsTo<RegistrationPeriod, $this>
     */
    public function registrationPeriod(): BelongsTo
    {
        return $this->belongsTo(RegistrationPeriod::class);
    }
}
