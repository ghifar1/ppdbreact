<?php

return [

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
