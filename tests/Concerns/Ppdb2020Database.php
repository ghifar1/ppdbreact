<?php

namespace Tests\Concerns;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * An in-memory copy of the ppdb2020 schema, built from its migrations.
 */
trait Ppdb2020Database
{
    /** Columns of ppdb2020's `biodatas` and `students` tables, in migration order. */
    private const BIODATA_COLUMNS = [
        'nisn', 'nik', 'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'agama', 'kewarganegaraan',
        'status_keluarga', 'status_siswa', 'anak_ke', 'jml_saudara_kandung', 'ikut_paud', 'ikut_tk', 'tinggal_di',
        'jarak_rumah_sekolah', 'transportasi', 'gol_darah', 'penyakit', 'kebutuhan_khusus', 'tinggi_badan',
        'berat_badan', 'hobi', 'cita_cita', 'alamat', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'kode_pos', 'telp',
        'jenis_sekolah', 'status_sekolah', 'nama_sekolah', 'alamat_sekolah', 'kota_asal_sekolah', 'thn_lulus_ijazah',
        'tanggal_kelulusan', 'no_ijazah', 'no_kk', 'kepala_keluarga', 'nama_ayah', 'nik_ayah', 'pendidikan_ayah',
        'pekerjaan_ayah', 'penghasilan_ayah', 'stat_hidup_ayah', 'nama_ibu', 'nik_ibu', 'pendidikan_ibu',
        'pekerjaan_ibu', 'penghasilan_ibu', 'stat_hidup_ibu', 'tot_hasil_ortu', 'stat_kepemilikan_rumah',
        'alamat_ortu', 'alamat_ortu_kelurahan', 'alamat_ortu_kecamatan', 'alamat_ortu_kota', 'alamat_ortu_provinsi',
        'alamat_ortu_kodepos', 'telp_ortu', 'nama_wali', 'pendidikan_wali', 'pekerjaan_wali', 'penghasilan_wali',
        'alamat_wali', 'alamat_wali_kelurahan', 'alamat_wali_kecamatan', 'alamat_wali_kota', 'alamat_wali_provinsi',
        'alamat_wali_kodepos', 'telp_wali', 'nama_lomba', 'bidang_lomba', 'tingkat_lomba', 'kategori_lomba',
        'prestasi_lomba', 'penyelenggara_lomba', 'tempat_lomba', 'beasiswa_dari', 'jenis_beasiswa', 'ranking',
        'no_skhun', 'no_peserta_un', 'nilai_skhun', 'rerata_skhun', 'npsn_sekolah_asal', 'tahun_masuk',
    ];

    protected function createPpdb2020Database(): ConnectionInterface
    {
        config(['database.connections.ppdb2020' => [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => false,
        ]]);
        DB::purge('ppdb2020');

        $schema = Schema::connection('ppdb2020');

        $schema->create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            $table->string('google_id')->nullable();
            $table->string('is_verified');
            $table->string('is_finalized');
            $table->string('nohp')->nullable();
            $table->string('registration_code')->nullable();
            $table->string('apakah_admin');
            $table->string('year', 50)->nullable();
        });

        foreach (['biodatas', 'students'] as $name) {
            $schema->create($name, function (Blueprint $table) {
                $table->id();
                foreach (self::BIODATA_COLUMNS as $column) {
                    $table->string($column)->nullable();
                }
                $table->unsignedBigInteger('user_id');
            });
        }

        $schema->create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('link');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
        });

        $schema->create('photo_profils', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('link');
            $table->timestamps();
        });

        $schema->create('submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('status');
            $table->longText('comment')->nullable();
            $table->string('checked_by')->nullable();
            $table->timestamps();
        });

        foreach (['no_registrations', 'no_registration_v2_s'] as $name) {
            $schema->create($name, function (Blueprint $table) use ($name) {
                $table->id();
                $table->integer('no_registration');
                $table->string('username_ujian');
                $table->string('password_ujian');
                $table->string('is_lulus');
                $table->unsignedBigInteger('user_id');
                if ($name === 'no_registration_v2_s') {
                    $table->year('tahun');
                }
                $table->timestamps();
            });
        }

        return DB::connection('ppdb2020');
    }

    /**
     * A registrant as ppdb2020's RegisterController created them: the password
     * is the random registration code.
     */
    protected function legacyUser(array $attributes = [], array $biodata = []): int
    {
        $db = DB::connection('ppdb2020');

        $id = $db->table('users')->insertGetId($attributes + [
            'name' => 'Siti Aminah',
            'email' => 'siti@example.com',
            'password' => password_hash('KODE123456', PASSWORD_BCRYPT, ['cost' => 4]),
            'is_verified' => 'true',
            'is_finalized' => 'false',
            'nohp' => '81234567890',
            'registration_code' => 'KODE123456',
            'apakah_admin' => '0',
            'year' => '2024',
            'created_at' => '2024-03-01 08:00:00',
            'updated_at' => '2024-03-02 09:00:00',
        ]);

        if ($biodata) {
            $db->table('biodatas')->insert($biodata + ['user_id' => $id]);
        }

        return $id;
    }

    protected function legacySubmission(int $userId, string $status, ?string $comment = null): void
    {
        DB::connection('ppdb2020')->table('submissions')->insert([
            'user_id' => $userId,
            'status' => $status,
            'comment' => $comment,
            'created_at' => '2024-04-10 10:00:00',
            'updated_at' => '2024-04-12 10:00:00',
        ]);
    }

    protected function legacyResult(int $userId, int $number, string $result, int $year = 2024): void
    {
        DB::connection('ppdb2020')->table('no_registration_v2_s')->insert([
            'user_id' => $userId,
            'no_registration' => $number,
            'username_ujian' => '0081234567',
            'password_ujian' => 'KODE123456',
            'is_lulus' => $result,
            'tahun' => $year,
            'created_at' => '2024-04-12 10:00:00',
            'updated_at' => '2024-04-12 10:00:00',
        ]);
    }
}
