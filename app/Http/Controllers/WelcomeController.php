<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome');
    }

    public function help()
    {
        return Inertia::render('Guess/Help');
    }
}
