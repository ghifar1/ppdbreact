<?php

namespace App\Http\Controllers;

use App\Enums\Jenjang;
use App\Services\RegistrationSchedule;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index(RegistrationSchedule $schedule)
    {
        return Inertia::render('Welcome', [
            'jenjangOptions' => Jenjang::options(),
            'jadwal' => config('ppdb.jadwal'),
            'pendaftaran' => $schedule->summary(),
        ]);
    }

    public function help(RegistrationSchedule $schedule)
    {
        return Inertia::render('Guess/Help', [
            'jadwal' => config('ppdb.jadwal'),
            'pendaftaran' => $schedule->summary(),
        ]);
    }
}
