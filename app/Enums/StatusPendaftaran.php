<?php

namespace App\Enums;

enum StatusPendaftaran: string
{
    case PengisianData = 'pengisian_data';
    case MenungguVerifikasi = 'menunggu_verifikasi';
    case PerluPerbaikan = 'perlu_perbaikan';
    case Terverifikasi = 'terverifikasi';
    case Lulus = 'lulus';
    case TidakLulus = 'tidak_lulus';

    public function label(): string
    {
        return match ($this) {
            self::PengisianData => 'Pengisian Data',
            self::MenungguVerifikasi => 'Menunggu Verifikasi',
            self::PerluPerbaikan => 'Perlu Perbaikan',
            self::Terverifikasi => 'Terverifikasi',
            self::Lulus => 'Lulus',
            self::TidakLulus => 'Tidak Lulus',
        };
    }

    /**
     * Whether the student may still change their answers.
     */
    public function canEdit(): bool
    {
        return in_array($this, [self::PengisianData, self::PerluPerbaikan], true);
    }

    /**
     * Whether the exam card can be downloaded.
     */
    public function hasExamCard(): bool
    {
        return in_array($this, [self::Terverifikasi, self::Lulus, self::TidakLulus], true);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ], self::cases());
    }
}
