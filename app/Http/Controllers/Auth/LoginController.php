<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
        $this->middleware('auth')->only('logout');
    }

    public function showLoginForm()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Students log in with their username instead of an email address.
     */
    public function username()
    {
        return 'username';
    }

    /**
     * The login field takes a username or an email address. Students imported
     * from ppdb2020 signed in there with their email.
     */
    protected function credentials(Request $request): array
    {
        $login = (string) $request->input($this->username());
        $field = str_contains($login, '@') ? 'email' : 'username';

        return [$field => $login, 'password' => $request->input('password')];
    }

    /**
     * The first password, shown on the registration status page until now,
     * is not needed there any more.
     *
     * @param  User  $user
     */
    protected function authenticated(Request $request, $user)
    {
        Payment::where('user_id', $user->id)->whereNotNull('account_password')->update(['account_password' => null]);
    }

    /**
     * Where to redirect users after login.
     */
    public function redirectTo(): string
    {
        return $this->guard()->user()->homePath();
    }
}
