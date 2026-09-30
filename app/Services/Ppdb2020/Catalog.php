<?php

namespace App\Services\Ppdb2020;

use App\Enums\FieldType;

/**
 * The forms of ppdb2020 expressed as ppdbreact menus and fields.
 *
 * Field keys are the column names of ppdb2020's `biodatas` table (documents
 * use their `documents.type`, plus `foto` for the profile photo). Fields that
 * already exist in the target jenjang with the same key are reused; missing
 * ones are created in the menu with the same title, which is created too if
 * needed. Labels, types, options and required flags follow the old forms.
 */
final class Catalog
{
    private const PENDIDIKAN = ['Tidak Berpendidikan', 'SD', 'SMP', 'SMA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];

    private const PEKERJAAN = [
        'Tidak Bekerja', 'PNS', 'TNI/Polisi', 'Guru/Dosen', 'Pegawai Swasta', 'Wirausaha/Wiraswasta',
        'Pengacara/Jaksa/Hakim/Notaris', 'Seniman/Pelukis/Artis/Sejenis', 'Dokter/Bidan/Perawat',
        'Pilot/Pramugara/i', 'Pedagang', 'Petani/Peternak', 'Nelayan', 'Buruh', 'Sopir/Masinis/Kondektur',
        'Politikus', 'Lainnya',
    ];

    private const PENGHASILAN = [
        'Kurang dari Rp 500.000', 'Rp 500.501 - 1.000.000', 'Rp 1.000.001 - 2.000.000',
        'Rp 2.000.001 - 3.000.000', 'Rp 3.000.001 - 5.000.000', 'Lebih dari Rp 5.000.000',
    ];

    private const STATUS_HIDUP = ['Masih Hidup', 'Sudah Meninggal', 'Tidak Diketahui'];

    /** Keys of file fields, mapped to the folder they live in under ppdb2020's storage/app/public. */
    public const DOCUMENT_FOLDERS = [
        'foto' => 'profils',
        'kk' => 'documents',
        'akte' => 'documents',
        'rapot' => 'documents',
        'skl' => 'documents',
    ];

    /**
     * @return list<array{title: string, description: string, after: ?string, fields: list<array<string, mixed>>}>
     */
    public static function menus(): array
    {
        return [
            [
                'title' => 'Data Pribadi',
                'description' => 'Silakan isi data pribadi, form wajib diisi jika mempunyai simbol bintang merah (*).',
                'after' => null,
                'fields' => [
                    self::text('nisn', 'NISN', true),
                    self::text('nik', 'NIK', true),
                    self::text('nama', 'Nama Lengkap', true),
                    self::select('jenis_kelamin', 'Jenis Kelamin', ['Laki-Laki', 'Perempuan'], true),
                    self::text('tempat_lahir', 'Tempat Lahir', true),
                    ['key' => 'tanggal_lahir', 'label' => 'Tanggal Lahir', 'type' => FieldType::Date, 'is_required' => true],
                    self::select('agama', 'Agama', ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Kong Hu Cu'], true),
                    self::select('kewarganegaraan', 'Kewarganegaraan', ['WNI', 'WNA'], true),
                    self::select('status_keluarga', 'Status dalam Keluarga', ['Anak Kandung', 'Anak Angkat'], true),
                    self::number('anak_ke', 'Anak Ke', true),
                    self::number('jml_saudara_kandung', 'Jumlah Saudara Kandung', true),
                    self::select('tinggal_di', 'Tinggal Bersama', [
                        'Bersama Orangtua', 'Bergantian tinggal di rumah orang tua yang berbeda', 'Bersama Saudara/Keluarga',
                        'Di asrama Madrasah', 'Kontrak/Kost', 'Panti Asuhan', 'Rumah Singgah',
                        'Tidak memiliki tempat tinggal yang tetap', 'Lainnya',
                    ], true),
                    self::select('jarak_rumah_sekolah', 'Jarak Rumah ke Sekolah', [
                        'Kurang dari 5 KM', 'Antara 5 - 10 KM', 'Antara 11 - 20 KM', 'Antara 21 - 30 KM', 'Lebih dari 31 KM',
                    ], true),
                    self::select('transportasi', 'Transportasi ke Sekolah', [
                        'Jalan Kaki', 'Sepeda', 'Sepeda Motor', 'Mobil Pribadi', 'Antar Jemput Sekolah', 'Angkutan Umum', 'Lainnya',
                    ], true),
                    self::select('gol_darah', 'Golongan Darah', ['A', 'B', 'AB', 'O']),
                    self::text('penyakit', 'Riwayat Penyakit'),
                    self::select('kebutuhan_khusus', 'Kebutuhan Khusus', [
                        'Tuna Rungu', 'Tuna Netra', 'Tuna Daksa', 'Tuna Grahita', 'Tuna Laras', 'Lamban Belajar',
                        'Sulit Belajar', 'Gangguan Komunikasi', 'Bakat Luar Biasa',
                    ]),
                    self::number('tinggi_badan', 'Tinggi Badan (cm)', true),
                    self::number('berat_badan', 'Berat Badan (kg)', true),
                    self::select('hobi', 'Hobi', ['Olahraga', 'Kesenian', 'Membaca', 'Menulis', 'Jalan-Jalan', 'Lainnya'], true),
                    self::select('cita_cita', 'Cita-Cita', [
                        'PNS', 'TNI/Polri', 'Guru/Dosen', 'Dokter', 'Politikus', 'Wiraswasta', 'Seniman/Artis', 'Ilmuwan', 'Lainnya',
                    ], true),
                    ['key' => 'alamat', 'label' => 'Alamat', 'type' => FieldType::Textarea, 'is_required' => true,
                        'help_text' => 'Sertakan nomor rumah dan RT/RW.'],
                    self::text('kelurahan', 'Kelurahan/Desa', true),
                    self::text('kecamatan', 'Kecamatan', true),
                    self::text('kota', 'Kabupaten/Kota', true),
                    self::text('provinsi', 'Provinsi', true),
                    self::text('kode_pos', 'Kode Pos', true),
                    ['key' => 'telp', 'label' => 'No. Telepon', 'type' => FieldType::Tel, 'is_required' => true],
                ],
            ],
            [
                'title' => 'Data Orang Tua',
                'description' => 'Data ayah dan ibu.',
                'after' => 'Data Pribadi',
                'fields' => [
                    self::text('no_kk', 'No. Kartu Keluarga', true),
                    self::text('kepala_keluarga', 'Nama Kepala Keluarga', true),
                    self::text('nama_ayah', 'Nama Ayah', true),
                    self::text('nik_ayah', 'NIK Ayah', true),
                    self::select('pendidikan_ayah', 'Pendidikan Ayah', self::PENDIDIKAN, true),
                    self::select('pekerjaan_ayah', 'Pekerjaan Ayah', self::PEKERJAAN, true),
                    self::select('penghasilan_ayah', 'Penghasilan Ayah', self::PENGHASILAN, true),
                    self::select('stat_hidup_ayah', 'Status Hidup Ayah', self::STATUS_HIDUP, true),
                    self::text('nama_ibu', 'Nama Ibu', true),
                    self::text('nik_ibu', 'NIK Ibu', true),
                    self::select('pendidikan_ibu', 'Pendidikan Ibu', self::PENDIDIKAN, true),
                    self::select('pekerjaan_ibu', 'Pekerjaan Ibu', self::PEKERJAAN, true),
                    self::select('penghasilan_ibu', 'Penghasilan Ibu', self::PENGHASILAN, true),
                    self::select('stat_hidup_ibu', 'Status Hidup Ibu', self::STATUS_HIDUP, true),
                    self::select('tot_hasil_ortu', 'Total Penghasilan Orang Tua', self::PENGHASILAN, true),
                    self::select('stat_kepemilikan_rumah', 'Status Kepemilikan Rumah', [
                        'Milik Sendiri', 'Rumah Orang Tua', 'Rumah Saudara/Kerabat', 'Rumah Dinas', 'Sewa/Kontrak', 'Lainnya',
                    ], true),
                    ['key' => 'alamat_ortu', 'label' => 'Alamat Orang Tua', 'type' => FieldType::Textarea, 'is_required' => true,
                        'help_text' => 'Sertakan nomor rumah dan RT/RW.'],
                    self::text('alamat_ortu_kelurahan', 'Kelurahan/Desa Orang Tua', true),
                    self::text('alamat_ortu_kecamatan', 'Kecamatan Orang Tua', true),
                    self::text('alamat_ortu_kota', 'Kabupaten/Kota Orang Tua', true),
                    self::text('alamat_ortu_provinsi', 'Provinsi Orang Tua', true),
                    self::text('alamat_ortu_kodepos', 'Kode Pos Orang Tua', true),
                    ['key' => 'telp_ortu', 'label' => 'No. HP Orang Tua', 'type' => FieldType::Tel, 'is_required' => true],
                ],
            ],
            [
                'title' => 'Data Wali',
                'description' => 'Isi jika siswa tinggal bersama wali.',
                'after' => 'Data Orang Tua',
                'fields' => [
                    self::text('nama_wali', 'Nama Wali'),
                    self::select('pendidikan_wali', 'Pendidikan Wali', self::PENDIDIKAN),
                    self::select('pekerjaan_wali', 'Pekerjaan Wali', self::PEKERJAAN),
                    self::select('penghasilan_wali', 'Penghasilan Wali', self::PENGHASILAN),
                    ['key' => 'alamat_wali', 'label' => 'Alamat Wali', 'type' => FieldType::Textarea],
                    self::text('alamat_wali_kelurahan', 'Kelurahan/Desa Wali'),
                    self::text('alamat_wali_kecamatan', 'Kecamatan Wali'),
                    self::text('alamat_wali_kota', 'Kabupaten/Kota Wali'),
                    self::text('alamat_wali_provinsi', 'Provinsi Wali'),
                    self::text('alamat_wali_kodepos', 'Kode Pos Wali'),
                    ['key' => 'telp_wali', 'label' => 'No. HP Wali', 'type' => FieldType::Tel],
                ],
            ],
            [
                'title' => 'Data Sekolah',
                'description' => 'Data sekolah asal.',
                'after' => 'Data Wali',
                'fields' => [
                    self::text('nama_sekolah', 'Asal Sekolah', true),
                    self::select('jenis_sekolah', 'Jenis Sekolah', ['SMP', 'MTs'], true),
                    self::select('status_sekolah', 'Status Sekolah', ['Negeri', 'Swasta'], true),
                    self::text('npsn_sekolah_asal', 'NPSN Sekolah Asal', true),
                    ['key' => 'alamat_sekolah', 'label' => 'Alamat Sekolah', 'type' => FieldType::Textarea, 'is_required' => true],
                    self::text('kota_asal_sekolah', 'Kota Asal Sekolah', true),
                    self::text('thn_lulus_ijazah', 'Tahun Lulus Ijazah'),
                    self::text('tanggal_kelulusan', 'Tanggal Kelulusan', true),
                    self::text('no_ijazah', 'No. Ijazah'),
                    self::text('no_skhun', 'No. SKHUN'),
                    self::text('no_peserta_un', 'No. Peserta Asesmen/UN'),
                    self::text('nilai_skhun', 'Nilai SKHUN'),
                    self::text('rerata_skhun', 'Rata-rata Nilai SKHUN'),
                    self::number('ranking', 'Ranking'),
                    self::select('ikut_paud', 'Pernah Ikut PAUD', ['Ya', 'Tidak'], true),
                    self::select('ikut_tk', 'Pernah Ikut TK', ['Ya', 'Tidak'], true),
                    self::text('tahun_masuk', 'Tahun Masuk', true),
                ],
            ],
            [
                'title' => 'Prestasi',
                'description' => 'Isi jika memiliki prestasi atau beasiswa.',
                'after' => 'Data Sekolah',
                'fields' => [
                    self::text('nama_lomba', 'Nama Lomba'),
                    self::select('bidang_lomba', 'Bidang Lomba', [
                        'Akademik', 'Keagamaan', 'Teknologi', 'Olahraga', 'Pramuka/Paskibraka', 'Karya Ilmiah', 'Kesenian',
                        'Pidato Bahasa Asing', 'Lainnya',
                    ]),
                    self::select('tingkat_lomba', 'Tingkat Lomba', ['Kabupaten/Kota', 'Provinsi', 'Nasional', 'Internasional']),
                    self::select('kategori_lomba', 'Kategori Lomba', ['Perorangan', 'Kelompok']),
                    self::select('prestasi_lomba', 'Prestasi yang Diraih', [
                        'Tidak Meraih Juara', 'Juara 1/Medali Emas', 'Juara 2/Medali Perak', 'Juara 3/Medali Perunggu',
                        'Juara Harapan 1', 'Juara Harapan 2', 'Juara Harapan 3', 'Juara Favorit',
                    ]),
                    self::text('penyelenggara_lomba', 'Penyelenggara Lomba'),
                    self::text('tempat_lomba', 'Tempat Lomba'),
                    self::select('beasiswa_dari', 'Beasiswa Dari', [
                        'Kemenag', 'Kementrian Lain', 'Pemda', 'BUMN', 'BUMD', 'Swasta', 'Yayasan', 'Perorangan', 'Lainnya',
                    ]),
                    self::select('jenis_beasiswa', 'Jenis Beasiswa', [
                        'Beasiswa Prestasi', 'Beasiswa Kurang Mampu/Miskin', 'Beasiswa Miskin dan Berprestasi', 'Beasiswa Lainnya',
                    ]),
                ],
            ],
            [
                'title' => 'Dokumen',
                'description' => 'Unggah berkas JPG, PNG, atau PDF, maksimal 2 MB per berkas.',
                'after' => 'Prestasi',
                'fields' => [
                    self::file('foto', 'Pas Foto'),
                    self::file('kk', 'Kartu Keluarga', true),
                    self::file('akte', 'Akta Kelahiran', true),
                    self::file('rapot', 'Rapor', true),
                    self::file('skl', 'Surat Keterangan Lulus'),
                ],
            ],
        ];
    }

    /**
     * Keys of all non-file fields, i.e. the biodata columns that are imported.
     *
     * @return list<string>
     */
    public static function dataKeys(): array
    {
        return collect(self::menus())
            ->flatMap(fn (array $menu) => $menu['fields'])
            ->reject(fn (array $field) => $field['type'] === FieldType::File)
            ->pluck('key')
            ->all();
    }

    private static function text(string $key, string $label, bool $required = false): array
    {
        return ['key' => $key, 'label' => $label, 'type' => FieldType::Text, 'is_required' => $required];
    }

    private static function number(string $key, string $label, bool $required = false): array
    {
        return ['key' => $key, 'label' => $label, 'type' => FieldType::Number, 'is_required' => $required];
    }

    private static function file(string $key, string $label, bool $required = false): array
    {
        return ['key' => $key, 'label' => $label, 'type' => FieldType::File, 'is_required' => $required];
    }

    /**
     * @param  list<string>  $options
     */
    private static function select(string $key, string $label, array $options, bool $required = false): array
    {
        return ['key' => $key, 'label' => $label, 'type' => FieldType::Select, 'options' => $options, 'is_required' => $required];
    }
}
