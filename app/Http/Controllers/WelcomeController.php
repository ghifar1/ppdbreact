<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome');
    }

    public function register()
    {
        return Inertia::render('Auth/Register');
    }

    public function help()
    {
        return Inertia::render('Guess/Help');
    }
}
