<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', [\App\Http\Controllers\WelcomeController::class, 'index']);
Route::get('/reg', [\App\Http\Controllers\WelcomeController::class, 'register']);
Route::get('/help', [\App\Http\Controllers\WelcomeController::class, 'help']);

Route::get('/dashboard', [\App\Http\Controllers\UserController::class, 'index']);
Route::get('/DataPribadi', [\App\Http\Controllers\PribadiController::class, 'index']);

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
