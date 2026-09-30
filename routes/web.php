<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\FileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Student;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index']);
Route::get('/help', [WelcomeController::class, 'help']);
Route::get('/reg', fn () => redirect()->route('register', request()->only('jenjang')));

Auth::routes(['reset' => false, 'confirm' => false, 'verify' => false]);

Route::middleware('auth')->group(function () {
    Route::get('/home', HomeController::class)->name('home');
    Route::get('/berkas/{answer}', FileController::class)->name('answers.file');
});

Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/dashboard', [Student\DashboardController::class, 'index'])->name('dashboard');
    Route::post('/finalisasi', [Student\DashboardController::class, 'finalize'])->name('finalisasi');
    Route::get('/kartu', [Student\DashboardController::class, 'card'])->name('kartu');
    Route::get('/formulir/{menu}', [Student\FormController::class, 'show'])->name('formulir.show');
    Route::post('/formulir/{menu}', [Student\FormController::class, 'update'])->name('formulir.update');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/menu', [Admin\MenuController::class, 'index'])->name('menus.index');
    Route::post('/menu', [Admin\MenuController::class, 'store'])->name('menus.store');
    Route::get('/menu/{menu}', [Admin\MenuController::class, 'edit'])->name('menus.edit');
    Route::put('/menu/{menu}', [Admin\MenuController::class, 'update'])->name('menus.update');
    Route::delete('/menu/{menu}', [Admin\MenuController::class, 'destroy'])->name('menus.destroy');
    Route::post('/menu/{menu}/move', [Admin\MenuController::class, 'move'])->name('menus.move');

    Route::post('/menu/{menu}/isian', [Admin\FieldController::class, 'store'])->name('fields.store');
    Route::put('/isian/{field}', [Admin\FieldController::class, 'update'])->name('fields.update');
    Route::delete('/isian/{field}', [Admin\FieldController::class, 'destroy'])->name('fields.destroy');
    Route::post('/isian/{field}/move', [Admin\FieldController::class, 'move'])->name('fields.move');

    Route::get('/siswa', [Admin\StudentController::class, 'index'])->name('students.index');
    Route::get('/siswa/{student}', [Admin\StudentController::class, 'show'])->name('students.show');
    Route::post('/siswa/{student}/status', [Admin\StudentController::class, 'updateStatus'])->name('students.status');
    Route::post('/siswa/{student}/password', [Admin\StudentController::class, 'resetPassword'])->name('students.password');
});
