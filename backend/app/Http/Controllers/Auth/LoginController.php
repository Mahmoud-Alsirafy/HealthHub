<?php

namespace App\Http\Controllers\Auth;

use App\Traits\AuthTrait;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    use AuthTrait;

    /**
     * Login - يدعم API و Web
     */
    public function login(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
        'type'     => 'required|in:users,doctors,laps,pharmas,paramedics',
    ]);

    $guard = $this->checkGuard($request);

    if ($request->expectsJson()) {
        // تحقق من البيانات بدون login
        if (!auth()->guard($guard)->validate([
            'email'    => $request->email,
            'password' => $request->password,
        ])) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // جيب الـ user
        $modelClass = $this->getModelFromGuard($guard);
        $user = $modelClass::where('email', $request->email)->first();

        // ابعت OTP
        $user->generate_code();
        $user->notify(new \App\Notifications\Otp());

        return response()->json([
            'message' => 'Verification code sent to your email',
            'id'      => $user->id,
            'type'    => $request->type,
        ]);
    }

    // Web
    if (Auth::guard($guard)->attempt([
        'email'    => $request->email,
        'password' => $request->password,
    ])) {
        return $this->redirect($request);
    }

    return back()->withErrors(['email' => 'Invalid credentials']);
}

    /**
     * Logout - يدعم API و Web
     */
    public function logout(Request $request)
{
    $guard = $this->checkGuard($request);

    if ($request->expectsJson()) {
        auth()->guard($guard)->logout();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    Auth::guard($guard)->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect()->route('selection');
}

    /**
     * Get Authenticated User
     */
    public function me(Request $request)
{
    // كل route بيستخدم guard مختلف
    // api/user/me  → auth:api
    // api/doctor/me → auth:doctor

    $guards = ['api', 'doctor', 'lap', 'pharma', 'paramedic'];

    foreach ($guards as $guard) {
        if (auth()->guard($guard)->check()) {
            return response()->json([
                'user' => auth()->guard($guard)->user(),
            ]);
        }
    }

    return response()->json(['message' => 'Unauthenticated'], 401);
}

    /**
     * Show Login Form (Web Only)
     */
    public function loginFom($type)
    {
        return response()->json([
            'message' => 'Login Form',
            'type'    => $type,
        ]);
    }
}
