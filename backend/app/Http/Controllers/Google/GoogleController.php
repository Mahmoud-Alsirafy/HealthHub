<?php

namespace App\Http\Controllers\Google;

use DB;
use Exception;
use App\Models\User;
use App\Notifications\Otp;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function googlepage()
    {

        return Socialite::driver('google')->stateless()->redirect();
    }

    public function googlepagecallback()
    {
        try {
            DB::beginTransaction();

            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                // Register new user
                $user = User::create([
                    'name'     => $googleUser->name,
                    'email'    => $googleUser->email,
                    'password' => Hash::make(Str::random(16)),
                    'qr_code'  => Str::random(64),
                ]);
            }

            // Generate JWT token for the user
            $token = Auth::guard('api')->login($user);

            DB::commit();

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/login?token=' . $token . '&type=users');

        } catch (Exception $e) {
            DB::rollBack();
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=google_auth_failed');
        }
    }

}
