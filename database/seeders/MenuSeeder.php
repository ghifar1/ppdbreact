<?php

namespace Database\Seeders;

use App\Enums\FieldType;
use App\Enums\Jenjang;
use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Default menus and fields for every jenjang. Admins can change all of
     * this later from the admin panel; jenjang that already have menus are
     * left untouched.
     */
    public function run(): void
    {
        foreach (Jenjang::cases() as $jenjang) {
            if (Menu::forJenjang($jenjang)->exists()) {
                continue;
            }

            foreach ($this->menus() as $order => $definition) {
                $menu = Menu::create([
                    'jenjang' => $jenjang,
                    'title' => $definition['title'],
                    'description' => $definition['description'],
                    'sort_order' => $order + 1,
                ]);

                foreach ($definition['fields'] as $fieldOrder => $field) {
                    $menu->fields()->create($field + ['sort_order' => $fieldOrder + 1]);
                }
            }
        }
    }

    /**
     * @return list<array{title: string, description: string, fields: list<array<string, mixed>>}>
     */
    private function menus(): array
    {
        return [
            [
                'title' => 'Data Pribadi',
                'description' => 'Silakan isi data pribadi, form wajib diisi jika mempunyai simbol bintang merah (*).',
                'fields' => [
                    ['label' => 'NIK', 'type' => FieldType::Text, 'is_required' => true, 'placeholder' => '16 digit sesuai Kartu Keluarga'],
                    ['label' => 'Nama Lengkap', 'type' => FieldType::Text, 'is_required' => true],
                    ['label' => 'Jenis Kelamin', 'type' => FieldType::Select, 'options' => ['Laki-Laki', 'Perempuan']],
                    ['label' => 'Tempat Lahir', 'type' => FieldType::Text, 'is_required' => true],
                    ['label' => 'Tanggal Lahir', 'type' => FieldType::Date, 'is_required' => true],
                ],
            ],
            [
                'title' => 'Data Orang Tua',
                'description' => 'Data ayah, ibu, atau wali.',
                'fields' => [
                    ['label' => 'Nama Ayah', 'type' => FieldType::Text, 'is_required' => true],
                    ['label' => 'Pekerjaan Ayah', 'type' => FieldType::Text],
                    ['label' => 'Nama Ibu', 'type' => FieldType::Text, 'is_required' => true],
                    ['label' => 'Pekerjaan Ibu', 'type' => FieldType::Text],
                    ['label' => 'No. HP Orang Tua', 'type' => FieldType::Tel, 'is_required' => true],
                ],
            ],
            [
                'title' => 'Data Sekolah',
                'description' => 'Data sekolah asal.',
                'fields' => [
                    ['label' => 'Asal Sekolah', 'type' => FieldType::Text, 'is_required' => true],
                    ['label' => 'NISN', 'type' => FieldType::Text, 'help_text' => 'Kosongkan jika belum memiliki NISN.'],
                    ['label' => 'Alamat Sekolah', 'type' => FieldType::Textarea],
                ],
            ],
            [
                'title' => 'Prestasi',
                'description' => 'Isi jika memiliki prestasi.',
                'fields' => [
                    ['label' => 'Nama Prestasi', 'type' => FieldType::Text],
                    ['label' => 'Tingkat', 'type' => FieldType::Select, 'options' => ['Sekolah', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional']],
                    ['label' => 'Tahun', 'type' => FieldType::Number],
                    ['label' => 'Sertifikat', 'type' => FieldType::File],
                ],
            ],
        ];
    }
}
