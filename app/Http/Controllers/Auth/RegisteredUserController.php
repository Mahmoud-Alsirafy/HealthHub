<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
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
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'national_id' => 'required'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'national_id' => $request->national_id,
        ]);
        event(new Registered($user));


        $user = User::where('email', $request->email)->first();

        // ! Genrate OTP Code

        $user->generate_code();

        // ! Email OTP

        $user->notify(new Otp());

        // ! SMS OTP
        $message = "Your OTP Code IS " . $user->code;

        $account_sid   = env('TWILIO_SID');
        $account_token = env('TWILIO_TOKEN');
        $account_from  = env('TWILIO_FROM');

        $client = new Client($account_sid, $account_token);

        $client->messages->create(
            '+201068492403', // رقم المستلم
            [
                'from' => $account_from,
                'body' => $message,
            ]
        );

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
