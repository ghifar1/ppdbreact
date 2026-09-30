<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Jenjang;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/dashboard';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    public function showRegistrationForm()
    {
        return Inertia::render('Auth/Register', [
            'jenjangOptions' => Jenjang::options(),
            'jenjang' => Jenjang::tryFrom((string) request('jenjang'))?->value ?? '',
        ]);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'jenjang' => ['required', Rule::enum(Jenjang::class)],
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'alpha_dash', 'min:4', 'max:30', 'unique:users'],
            'no_hp' => ['required', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
    }

    /**
     * Create a new student after a valid registration.
     *
     * @return User
     */
    protected function create(array $data)
    {
        return User::create([
            'jenjang' => $data['jenjang'],
            'name' => $data['name'],
            'username' => $data['username'],
            'no_hp' => $data['no_hp'],
            'password' => $data['password'],
        ]);
    }
}
