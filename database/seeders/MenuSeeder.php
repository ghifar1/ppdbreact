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
                    ['key' => 'nik', 'label' => 'NIK', 'type' => FieldType::Text, 'is_required' => true, 'placeholder' => '16 digit sesuai Kartu Keluarga'],
                    ['key' => 'nama', 'label' => 'Nama Lengkap', 'type' => FieldType::Text, 'is_required' => true],
                    ['key' => 'jenis_kelamin', 'label' => 'Jenis Kelamin', 'type' => FieldType::Select, 'options' => ['Laki-Laki', 'Perempuan']],
                    ['key' => 'tempat_lahir', 'label' => 'Tempat Lahir', 'type' => FieldType::Text, 'is_required' => true],
                    ['key' => 'tanggal_lahir', 'label' => 'Tanggal Lahir', 'type' => FieldType::Date, 'is_required' => true],
                ],
            ],
            [
                'title' => 'Data Orang Tua',
                'description' => 'Data ayah, ibu, atau wali.',
                'fields' => [
                    ['key' => 'nama_ayah', 'label' => 'Nama Ayah', 'type' => FieldType::Text, 'is_required' => true],
                    ['key' => 'pekerjaan_ayah', 'label' => 'Pekerjaan Ayah', 'type' => FieldType::Text],
                    ['key' => 'nama_ibu', 'label' => 'Nama Ibu', 'type' => FieldType::Text, 'is_required' => true],
                    ['key' => 'pekerjaan_ibu', 'label' => 'Pekerjaan Ibu', 'type' => FieldType::Text],
                    ['key' => 'telp_ortu', 'label' => 'No. HP Orang Tua', 'type' => FieldType::Tel, 'is_required' => true],
                ],
            ],
            [
                'title' => 'Data Sekolah',
                'description' => 'Data sekolah asal.',
                'fields' => [
                    ['key' => 'nama_sekolah', 'label' => 'Asal Sekolah', 'type' => FieldType::Text, 'is_required' => true],
                    ['key' => 'nisn', 'label' => 'NISN', 'type' => FieldType::Text, 'help_text' => 'Kosongkan jika belum memiliki NISN.'],
                    ['key' => 'alamat_sekolah', 'label' => 'Alamat Sekolah', 'type' => FieldType::Textarea],
                ],
            ],
            [
                'title' => 'Prestasi',
                'description' => 'Isi jika memiliki prestasi.',
                'fields' => [
                    ['key' => 'nama_lomba', 'label' => 'Nama Prestasi', 'type' => FieldType::Text],
                    ['key' => 'tingkat_lomba', 'label' => 'Tingkat', 'type' => FieldType::Select, 'options' => ['Sekolah', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional']],
                    ['label' => 'Tahun', 'type' => FieldType::Number],
                    ['label' => 'Sertifikat', 'type' => FieldType::File],
                ],
            ],
        ];
    }
}
