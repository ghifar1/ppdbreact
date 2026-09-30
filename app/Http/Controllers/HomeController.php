<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Send the logged-in user to their dashboard.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        return redirect($request->user()->homePath());
    }
}
