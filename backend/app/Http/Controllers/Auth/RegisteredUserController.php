<?php

namespace App\Http\Controllers\Auth;

use App\Traits\AuthTrait;
use Twilio\Rest\Client;
use Illuminate\View\View;
use App\Notifications\Otp;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Registered;

class RegisteredUserController extends Controller
{
    use AuthTrait;

    private array $registrationTypes = [
        'users' => 'Patient',
        'doctors' => 'Doctor',
        'labs' => 'Lab',
        'pharmas' => 'Pharmacy',
        'paramedics' => 'Paramedic',
    ];

    /**
     * Display the registration view.
     */
    public function create(Request $request): View
    {
        return view('auth.register', [
            'type' => $request->query('type', 'users'),
            'registrationTypes' => $this->registrationTypes,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $guard = $this->checkGuard($request);
        $modelClass = $this->getModelFromGuard($guard);
        $tableName = (new $modelClass)->getTable();

        $request->validate([
            'type' => ['required', 'in:users,doctors,labs,pharmas,paramedics'],
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . $tableName],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'national_id' => ['required_if:type,users,doctors', 'nullable'],
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ];

        if (in_array($request->type, ['users', 'doctors'], true)) {
            $data['national_id'] = $request->national_id;
        }

        $user = $modelClass::create($data);

        if ($request->type === 'users') {
            event(new Registered($user));
        }

        $user->generate_code();
        $user->notify(new Otp());

        if ($request->type === 'users') {
            $message = "Your OTP Code IS " . $user->code;
            $account_sid = env('TWILIO_SID');
            $account_token = env('TWILIO_TOKEN');
            $account_from = env('TWILIO_FROM');

            $client = new Client($account_sid, $account_token);
            $client->messages->create(
                '+201068492403',
                [
                    'from' => $account_from,
                    'body' => $message,
                ]
            );
        }

        if ($guard === 'api') {
            Auth::login($user);
        } else {
            Auth::guard($guard)->login($user);
        }

        return $this->redirect($request);
    }
}
