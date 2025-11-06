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

        $finduser = User::where('email', $googleUser->email)->first();

        // 1) لو الإيميل مش موجود → اعمله Create + Login + OTP
        if (!$finduser) {
            $authUser = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'password' => Hash::make(Str::random(16)),
            ]);

            Auth::login($authUser);

            $authUser->generate_code();
            $authUser->notify(new Otp());

            DB::commit();
            return redirect()->route('OTP.index');
        }

        // 2) لو موجود + كان مسجل بجوجل قبل كده (password null)
        if ($finduser) {
            $authUser = $finduser;

            Auth::login($authUser);

            $authUser->generate_code();
            $authUser->notify(new Otp());

            DB::commit();
            return redirect()->route('OTP.index');
        }

        // 3) لو عنده باسورد → لازم يدخل بحسابه العادي
        toastr()->error('Try Normal Login, This account registered before by password.');
        return redirect()->route('login');

    } catch (Exception $e) {
        DB::rollBack();
        dd($e->getMessage());
    }
}

}
