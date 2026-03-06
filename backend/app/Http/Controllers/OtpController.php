<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Lap;
use App\Models\Pharma;
use App\Models\Paramedic;
use App\Notifications\Otp;
use App\Traits\AuthTrait;
use Illuminate\Http\Request;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Auth;

class OtpController extends Controller
{
    use AuthTrait;

    /**
     * Display a listing of the resource.
     */
    public function index($type, $id)
    {
        return response()->json(['message' => 'OTP Verify Page', 'type' => $type, 'id' => $id]);
    }



    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    protected function getModel($type)
    {
        $models = [
            'users' => User::class,
            'doctors' => Doctor::class,
            'laps' => Lap::class,
            'pharmas' => Pharma::class,
            'paramedics' => Paramedic::class,
        ];

        return $models[$type] ?? null;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'type' => 'required|string',
        'id'   => 'required|integer',
        'otp'  => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $modelClass = $this->getModel($request->type);
    if (!$modelClass) {
        return response()->json(['error' => trans('auth.failed')], 404);
    }

    $user = $modelClass::find($request->id);
    if (!$user) {
        return response()->json(['error' => trans('auth.failed')], 404);
    }

    if ($user->expierd_at && now()->greaterThan($user->expierd_at)) {
        return response()->json(['error' => trans('auth.expierd')], 400);
    }

    if ($request->otp != $user->code) {
        return response()->json(['error' => trans('auth.error_OTP')], 400);
    }

    // ✅ reset الكود
    $user->reset_code();

    $guard = $this->checkGuard($request);

    // return $guard;
    // ✅ لو API → رجّع JWT token
    if ($request->expectsJson()) {
        $token = auth()->guard($guard)->login($user);

        return response()->json([
            'message' => trans('auth.success_login'),
            'token'   => $token,
            'type'    => 'bearer',
            'user'    => $user,
        ]);
    }

    // ✅ لو Web → session login + redirect
    Auth::guard($guard)->login($user);
    return $this->redirect($request);
}

    public function resend($type, $id)
    {
        $modelClass = $this->getModel($type);
        if (!$modelClass) {
            return response()->json(['error' => 'User not found!'], 404);
        }

        $user = $modelClass::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found!'], 404);
        }

        // لو الكود لسه شغال بلاش نعيده
        if ($user->expierd_at && now()->lessThan($user->expierd_at)) {
            return response()->json(['message' => trans('auth.work'), 'expires_at' => $user->expierd_at], 200);
        }

        // اعمل كود جديد
        $user->generate_code();
        $user->notify(new Otp());

        return response()->json(['message' => trans('auth.resend'), 'expires_at' => $user->expierd_at], 200);
    }



    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
