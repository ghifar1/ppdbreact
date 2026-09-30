<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Identitas Sekolah
    |--------------------------------------------------------------------------
    |
    | Shown in the header, footer, login page and exam card. `logo` is a path
    | inside public/ (e.g. "images/logo.png"); leave it empty to use the
    | built-in crest.
    |
    */

    'sekolah' => [
        'nama' => env('PPDB_SEKOLAH', 'Madrasah Terpadu'),
        'yayasan' => env('PPDB_YAYASAN'),
        'alamat' => env('PPDB_ALAMAT'),
        'telepon' => env('PPDB_TELEPON'),
        'email' => env('PPDB_EMAIL'),
        'logo' => env('PPDB_LOGO'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tahun Ajaran
    |--------------------------------------------------------------------------
    |
    | Printed on the exam card (kartu ujian).
    |
    */

    'tahun' => env('PPDB_TAHUN', '2022/2023'),

    /*
    |--------------------------------------------------------------------------
    | Jadwal
    |--------------------------------------------------------------------------
    |
    | Dates shown on each step of the student's dashboard timeline.
    |
    */

    'jadwal' => [
        'pengisian' => '3 April - 8 Juli 2022',
        'finalisasi' => '3 April - 8 Juli 2022',
        'verifikasi' => '',
        'kartu' => '3 April - 10 Juli 2022',
        'seleksi' => '15 Juli 2022',
    ],

];
