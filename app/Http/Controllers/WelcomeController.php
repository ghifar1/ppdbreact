<?php

namespace App\Http\Controllers;

use App\Enums\Jenjang;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            'jenjangOptions' => Jenjang::options(),
            'jadwal' => config('ppdb.jadwal'),
        ]);
    }

    public function help()
    {
        return Inertia::render('Guess/Help', [
            'jadwal' => config('ppdb.jadwal'),
        ]);
    }
}
