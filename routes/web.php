<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\PribadiController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index']);
Route::get('/reg', [WelcomeController::class, 'register']);
Route::get('/help', [WelcomeController::class, 'help']);

Route::get('/dashboard', [UserController::class, 'index']);
Route::get('/DataPribadi', [PribadiController::class, 'index']);

Auth::routes();

Route::get('/home', [HomeController::class, 'index'])->name('home');
