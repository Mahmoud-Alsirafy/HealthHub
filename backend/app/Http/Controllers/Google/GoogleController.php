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
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        try {
            DB::beginTransaction();

            $googleUser = Socialite::driver('google')->stateless()->user();
            $finduser = User::where('email', $googleUser->email)->first();

            if (!$finduser) {
                $finduser = User::create([
                    'name'     => $googleUser->name,
                    'email'    => $googleUser->email,
                    'password' => Hash::make(Str::random(16)),
                    'qr_code'  => Str::random(64),
                ]);
            }

            // ✅ مش بنعمل OTP مع Google - بنعمل JWT مباشرة
            $token = Auth::guard('api')->login($finduser);

            DB::commit();

            return redirect($frontendUrl . '/login?token=' . $token . '&type=users');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect($frontendUrl . '/login?error=google_auth_failed');
        }
    }
}
