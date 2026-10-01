<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\FileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PaymentProofController;
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
    Route::get('/bukti-pembayaran/{payment}', PaymentProofController::class)->name('payments.proof');
});

Route::middleware(['auth', 'role:student'])->group(function () {
    Route::get('/dashboard', [Student\DashboardController::class, 'index'])->name('dashboard');
    Route::post('/finalisasi', [Student\DashboardController::class, 'finalize'])->name('finalisasi');
    Route::get('/kartu', [Student\DashboardController::class, 'card'])->name('kartu');
    Route::get('/kelulusan', [Student\DashboardController::class, 'letter'])->name('kelulusan');
    Route::get('/pembayaran', [Student\PaymentController::class, 'show'])->name('pembayaran');
    Route::post('/pembayaran', [Student\PaymentController::class, 'store'])->name('pembayaran.store');
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

    Route::get('/gelombang', [Admin\RegistrationPeriodController::class, 'index'])->name('periods.index');
    Route::post('/gelombang', [Admin\RegistrationPeriodController::class, 'store'])->name('periods.store');
    Route::put('/gelombang/{period}', [Admin\RegistrationPeriodController::class, 'update'])->name('periods.update');
    Route::delete('/gelombang/{period}', [Admin\RegistrationPeriodController::class, 'destroy'])->name('periods.destroy');

    Route::get('/pengaturan', [Admin\AdmissionSettingController::class, 'index'])->name('settings.index');
    Route::put('/pengaturan/{jenjang}', [Admin\AdmissionSettingController::class, 'update'])->name('settings.update');

    Route::get('/jadwal-ujian', [Admin\ExamScheduleController::class, 'index'])->name('exam-schedules.index');
    Route::post('/jadwal-ujian', [Admin\ExamScheduleController::class, 'store'])->name('exam-schedules.store');
    Route::put('/jadwal-ujian/{schedule}', [Admin\ExamScheduleController::class, 'update'])->name('exam-schedules.update');
    Route::delete('/jadwal-ujian/{schedule}', [Admin\ExamScheduleController::class, 'destroy'])->name('exam-schedules.destroy');

    Route::get('/pembayaran', [Admin\PaymentController::class, 'index'])->name('payments.index');
    Route::post('/pembayaran/{payment}/terima', [Admin\PaymentController::class, 'confirm'])->name('payments.confirm');
    Route::post('/pembayaran/{payment}/tolak', [Admin\PaymentController::class, 'reject'])->name('payments.reject');
    Route::post('/siswa/{student}/pembayaran', [Admin\PaymentController::class, 'recordCash'])->name('payments.cash');

    Route::get('/akun-ujian', [Admin\ExamAccountController::class, 'index'])->name('exam.index');
    Route::post('/akun-ujian', [Admin\ExamAccountController::class, 'generate'])->name('exam.generate');
    Route::get('/akun-ujian/unduh', [Admin\ExamAccountController::class, 'export'])->name('exam.export');
    Route::post('/siswa/{student}/akun-ujian', [Admin\ExamAccountController::class, 'reset'])->name('exam.reset');

    Route::get('/siswa', [Admin\StudentController::class, 'index'])->name('students.index');
    Route::get('/siswa/baru', [Admin\StudentAccountController::class, 'create'])->name('students.create');
    Route::post('/siswa', [Admin\StudentAccountController::class, 'store'])->name('students.store');
    Route::get('/siswa/{student}/kartu-login', [Admin\StudentAccountController::class, 'loginCard'])->name('students.login-card');
    Route::post('/siswa/{student}/kartu-login', [Admin\StudentAccountController::class, 'newPassword'])->name('students.new-password');
    Route::get('/siswa/{student}', [Admin\StudentController::class, 'show'])->name('students.show');
    Route::post('/siswa/{student}/status', [Admin\StudentController::class, 'updateStatus'])->name('students.status');
    Route::post('/siswa/{student}/password', [Admin\StudentController::class, 'resetPassword'])->name('students.password');
});
