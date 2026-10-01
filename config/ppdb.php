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
        // City printed before the date on letters, e.g. "Jakarta, 4 Juli 2027".
        'kota' => env('PPDB_KOTA'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tahun Ajaran
    |--------------------------------------------------------------------------
    |
    | Printed on the exam card (kartu ujian) and the result letter.
    |
    */

    'tahun' => env('PPDB_TAHUN', '2022/2023'),

];
