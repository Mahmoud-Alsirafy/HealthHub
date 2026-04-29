<?php

namespace App\Http\Controllers\Google;

use App\Http\Controllers\Controller;
use App\Notifications\Otp;
use DB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function googlepage(Request $request)
{
    $type = $request->type ?? 'users';

    // ✅ استخدم state بدل session عشان stateless
    return Socialite::driver('google')
        ->stateless()
        ->with(['state' => $type])
        ->redirect();
}

public function googlepagecallback(Request $request)
{
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

    // ✅ جيب الـ type من الـ state مش من الـ session
    $type = $request->input('state', 'users');

    $guardMap = [
        'users'      => ['guard' => 'api',      'model' => \App\Models\User::class],
        'doctors'    => ['guard' => 'doctor',    'model' => \App\Models\Doctor::class],
        'pharmas'    => ['guard' => 'pharma',    'model' => \App\Models\Pharma::class],
        'labs'       => ['guard' => 'lab',       'model' => \App\Models\Lab::class],
        'paramedics' => ['guard' => 'paramedic', 'model' => \App\Models\Paramedic::class],
    ];

    // ✅ تأكد إن الـ type صح
    $config = $guardMap[$type] ?? $guardMap['users'];

    $finduser = null; // ✅ عشان الـ catch ميعملش error

    try {
        DB::beginTransaction();

        $googleUser = Socialite::driver('google')->stateless()->user();

        $finduser = $config['model']::where('email', $googleUser->email)->first();

        if (!$finduser) {
            // ✅ Allow registration for all types via Google
            $finduser = $config['model']::create([
                'name'     => $googleUser->name,
                'email'    => $googleUser->email,
                'password' => Hash::make(Str::random(16)),
                'qr_code'  => Str::random(64),
            ]);
        }

        $token = Auth::guard($config['guard'])->login($finduser);

        DB::commit();

        $finduser->generate_code();
        $finduser->notify(new \App\Notifications\Otp());

        // ✅ رجّع الـ token مع الـ redirect
        return redirect($frontendUrl . '/login?id=' . $finduser->id . '&type=' . $type . '&otp=true');

    } catch (Exception $e) {
        DB::rollBack();

        // ✅ مشكلة واحدة بس في الـ catch
        $userId = $finduser?->id ?? '';
        return redirect($frontendUrl . '/login?error=google_auth_failed&id=' . $userId . '&type=' . $type);
    }
}
}
