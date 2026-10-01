<?php

namespace App\Enums;

enum FieldType: string
{
    case Text = 'text';
    case Textarea = 'textarea';
    case Number = 'number';
    case Email = 'email';
    case Tel = 'tel';
    case Date = 'date';
    case Select = 'select';
    case Radio = 'radio';
    case Checkbox = 'checkbox';
    case File = 'file';

    public function label(): string
    {
        return match ($this) {
            self::Text => 'Teks singkat',
            self::Textarea => 'Teks panjang',
            self::Number => 'Angka',
            self::Email => 'Email',
            self::Tel => 'Nomor telepon',
            self::Date => 'Tanggal',
            self::Select => 'Pilihan (dropdown)',
            self::Radio => 'Pilihan ganda (radio)',
            self::Checkbox => 'Kotak centang (boleh lebih dari satu)',
            self::File => 'Unggah berkas (JPG, PNG, PDF)',
        };
    }

    /**
     * Whether the admin has to provide a list of options for this type.
     */
    public function hasOptions(): bool
    {
        return in_array($this, [self::Select, self::Radio, self::Checkbox], true);
    }

    /**
     * @return list<array{value: string, label: string, hasOptions: bool}>
     */
    public static function options(): array
    {
        return array_map(fn (self $type) => [
            'value' => $type->value,
            'label' => $type->label(),
            'hasOptions' => $type->hasOptions(),
        ], self::cases());
    }
}
