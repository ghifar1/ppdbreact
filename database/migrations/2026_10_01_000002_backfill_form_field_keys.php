<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Keys for the fields created by MenuSeeder, so data imported from
     * ppdb2020 lands in them instead of in duplicate fields.
     *
     * @var array<string, array<string, string>>
     */
    private const DEFAULT_KEYS = [
        'Data Pribadi' => [
            'NIK' => 'nik',
            'Nama Lengkap' => 'nama',
            'Jenis Kelamin' => 'jenis_kelamin',
            'Tempat Lahir' => 'tempat_lahir',
            'Tanggal Lahir' => 'tanggal_lahir',
        ],
        'Data Orang Tua' => [
            'Nama Ayah' => 'nama_ayah',
            'Pekerjaan Ayah' => 'pekerjaan_ayah',
            'Nama Ibu' => 'nama_ibu',
            'Pekerjaan Ibu' => 'pekerjaan_ibu',
            'No. HP Orang Tua' => 'telp_ortu',
        ],
        'Data Sekolah' => [
            'Asal Sekolah' => 'nama_sekolah',
            'NISN' => 'nisn',
            'Alamat Sekolah' => 'alamat_sekolah',
        ],
        'Prestasi' => [
            'Nama Prestasi' => 'nama_lomba',
            'Tingkat' => 'tingkat_lomba',
        ],
    ];

    /**
     * Give the fields MenuSeeder created before field keys existed their key.
     * Fields an admin renamed or duplicated are left alone.
     */
    public function up(): void
    {
        foreach (self::DEFAULT_KEYS as $title => $labels) {
            foreach ($labels as $label => $key) {
                $fields = DB::table('form_fields')
                    ->join('menus', 'menus.id', '=', 'form_fields.menu_id')
                    ->where('menus.title', $title)
                    ->where('form_fields.label', $label)
                    ->whereNull('form_fields.key')
                    ->get(['form_fields.id', 'menus.jenjang']);

                foreach ($fields->groupBy('jenjang') as $jenjang => $matches) {
                    $taken = DB::table('form_fields')
                        ->join('menus', 'menus.id', '=', 'form_fields.menu_id')
                        ->where('menus.jenjang', $jenjang)
                        ->where('form_fields.key', $key)
                        ->exists();

                    if (! $taken && $matches->count() === 1) {
                        DB::table('form_fields')->where('id', $matches->first()->id)->update(['key' => $key]);
                    }
                }
            }
        }
    }
};
