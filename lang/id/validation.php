<?php

/*
|--------------------------------------------------------------------------
| Validation Language Lines
|--------------------------------------------------------------------------
|
| Indonesian messages for the rules this application uses. Any rule not
| listed here falls back to the English message (fallback_locale).
|
*/

return [

    'alpha_dash' => ':attribute hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
    'array' => ':attribute harus berupa daftar pilihan.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'date' => ':attribute bukan tanggal yang valid.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'enum' => ':attribute yang dipilih tidak valid.',
    'file' => ':attribute harus berupa berkas.',
    'in' => ':attribute yang dipilih tidak valid.',
    'integer' => ':attribute harus berupa bilangan bulat.',
    'max' => [
        'array' => ':attribute tidak boleh lebih dari :max pilihan.',
        'file' => ':attribute tidak boleh lebih dari :max kilobyte.',
        'numeric' => ':attribute tidak boleh lebih dari :max.',
        'string' => ':attribute tidak boleh lebih dari :max karakter.',
    ],
    'mimes' => ':attribute harus berupa berkas bertipe: :values.',
    'min' => [
        'array' => ':attribute minimal berisi :min pilihan.',
        'file' => ':attribute minimal berukuran :min kilobyte.',
        'numeric' => ':attribute minimal bernilai :min.',
        'string' => ':attribute minimal berisi :min karakter.',
    ],
    'numeric' => ':attribute harus berupa angka.',
    'regex' => 'Format :attribute tidak valid.',
    'required' => ':attribute wajib diisi.',
    'required_if' => ':attribute wajib diisi jika :other adalah :value.',
    'string' => ':attribute harus berupa teks.',
    'unique' => ':attribute sudah digunakan.',
    'uploaded' => ':attribute gagal diunggah.',

    'attributes' => [
        'name' => 'nama lengkap',
        'username' => 'username',
        'password' => 'kata sandi',
        'no_hp' => 'nomor HP',
        'jenjang' => 'jenjang',
        'label' => 'label',
        'type' => 'tipe',
        'options' => 'pilihan',
        'title' => 'judul',
        'catatan_admin' => 'catatan',
        'status' => 'status',
    ],

];
