<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Jenjang;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admission;
use App\Services\RegistrationSchedule;
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
            'pendaftaran' => $this->schedule()->summary(),
            'rekening' => collect(Jenjang::cases())->mapWithKeys(fn (Jenjang $jenjang) => [
                $jenjang->value => app(Admission::class)->bankAccount($jenjang),
            ]),
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
            'jenjang' => ['required', Rule::enum(Jenjang::class), function (string $attribute, mixed $value, \Closure $fail) {
                $jenjang = Jenjang::tryFrom((string) $value);

                $status = $jenjang ? $this->schedule()->for($jenjang) : null;

                if ($status && ! $status['open']) {
                    $fail("Pendaftaran {$jenjang->label()} sedang ditutup.");
                } elseif ($status && app(Admission::class)->feeForNewRegistrant($jenjang, $status['current']) > 0) {
                    // Accounts for a jenjang with a fee are made by the committee after the payment.
                    $fail("Pendaftaran {$jenjang->label()} dilakukan dengan mengirim bukti pembayaran.");
                }
            }],
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
        $user = new User([
            'jenjang' => $data['jenjang'],
            'name' => $data['name'],
            'username' => $data['username'],
            'no_hp' => $data['no_hp'],
            'password' => $data['password'],
        ]);
        $user->registration_period_id = $this->schedule()->currentPeriod(Jenjang::from($data['jenjang']))?->id;
        $user->save();

        return $user;
    }

    /**
     * Resolved per use: controller instances can outlive a request (they are
     * cached on the route), while the schedule remembers the periods it read.
     */
    private function schedule(): RegistrationSchedule
    {
        return app(RegistrationSchedule::class);
    }
}
