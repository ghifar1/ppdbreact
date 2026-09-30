# PPDB React

Online student admission (PPDB) for MI, MTs and MA, built with Laravel, Inertia, React and shadcn/ui.

- **Students** register with a username, pick their school level, and fill in the forms under each menu.
- **Admins** decide which menus each level has and which fields each form contains, then review, verify and grade registrations.

## Setup

Requires PHP 8.3+, Composer, Node.js 20+ and a MySQL database.

```bash
composer install
cp .env.example .env        # then set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
php artisan migrate
php artisan db:seed          # default menus (Data Pribadi, Orang Tua, Sekolah, Prestasi) for every level
php artisan ppdb:admin       # create the first admin account
npm install
npm run build                # or `npm run dev` while developing
```

Admins log in at `/login` like students and land on `/admin`, where **Menu & Formulir** manages the menus and form fields per level and **Data Siswa** lists registrations.

Timeline dates on the student dashboard and landing page, and the academic year, are set in `config/ppdb.php`.

### School identity

The school's name and contact details appear in the header, footer, login page and exam card. Set them in `.env`:

```dotenv
PPDB_SEKOLAH="Madrasah Al-Hikmah"
PPDB_YAYASAN="Yayasan Pendidikan Al-Hikmah"   # optional
PPDB_ALAMAT="Jl. Pendidikan No. 1, Bogor"      # optional, shown in the footer
PPDB_TELEPON="0251-123456"                      # optional
PPDB_EMAIL="ppdb@example.sch.id"                # optional
PPDB_LOGO=images/logo.png                       # optional, a file in public/; the built-in crest is used when empty
PPDB_TAHUN=2027/2028
```

The theme (deep green and gold, with uniform colors per level: MI red, MTs navy, MA grey) lives in `resources/css/app.css` as CSS variables, so colors can be changed in one place. Dark mode is supported and remembered per browser.

Uploaded files are stored privately in `storage/app/private/ppdb` and are only served to the owning student and admins.

### Importing data from ppdb2020

`php artisan ppdb:import-2020` copies registrations from the old [ppdb2020](https://github.com/ghifar1/ppdb2020) app. It only reads the old database; nothing there is changed.

1. Point the `ppdb2020` connection at the old database in `.env` (`PPDB2020_DB_HOST`, `PPDB2020_DB_DATABASE`, `PPDB2020_DB_USERNAME`, `PPDB2020_DB_PASSWORD`).
2. Make the old `storage/app/public` folder (with `documents/` and `profils/`) readable on this server.
3. Run `php artisan migrate`, then a dry run to see what would happen:

```bash
php artisan ppdb:import-2020 --files=/path/to/ppdb2020/storage/app/public --dry-run
php artisan ppdb:import-2020 --files=/path/to/ppdb2020/storage/app/public
```

| Option | |
| --- | --- |
| `--files=` | ppdb2020's `storage/app/public` folder. Without it, documents are not copied. |
| `--jenjang=ma` | Level the students are imported into (ppdb2020 was MA only). |
| `--year=2024` | Only import students who registered that year; repeat for more years. The dry run lists students per year. |
| `--admins` | Also import admin accounts. |
| `--update` | Refresh students imported earlier (status, answers, documents). Usernames and passwords are never changed. |
| `--dry-run` | Report only; nothing is saved. |

What is carried over:

- **Accounts**: name, phone and the old password, so students log in as before. Email logins can use their email (the login page accepts a username or an email); plain-username logins keep their username unless it is taken. Accounts created with Google Sign-In had no password and need a reset from **Data Siswa**. A CSV with each account's new login and a note is written to `storage/app/private/ppdb-import/`.
- **Form data**: every `biodatas` column, in menus that mirror the old forms (Data Pribadi, Data Orang Tua, Data Wali, Data Sekolah, Prestasi, Dokumen). Existing fields with the same meaning are reused, missing ones are created. Birth dates typed as `dd/mm/yyyy` become dates; values not in a dropdown's choices are added as choices and listed in the report.
- **Documents**: KK, akta, rapor, SKL and the profile photo, copied into private storage.
- **Status**: waiting → Menunggu Verifikasi, rejected (with the committee's comment) → Perlu Perbaikan, accepted → Terverifikasi, and the selection result → Lulus / Tidak Lulus. The old exam number becomes the registration number (e.g. `MA-2024-007`).

Not imported: payments (`pembayarans`), registration waves, logs, settings, and the e-learning exam accounts.

The import runs in a single transaction, so an error leaves nothing half-imported. Running it again skips students it already imported.

---

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400"></a></p>

<p align="center">
<a href="https://travis-ci.org/laravel/framework"><img src="https://travis-ci.org/laravel/framework.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains over 1500 video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the Laravel [Patreon page](https://patreon.com/taylorotwell).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Cubet Techno Labs](https://cubettech.com)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[Many](https://www.many.co.uk)**
- **[Webdock, Fast VPS Hosting](https://www.webdock.io/en)**
- **[DevSquad](https://devsquad.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
"# ppdbreact" 
