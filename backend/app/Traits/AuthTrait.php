<?php

namespace App\Traits;

use App\Providers\RouteServiceProvider;

trait AuthTrait
{
    /**
     * تحديد الـ Guard بناءً على نوع المستخدم
     *
     * users      → api      (JWT)
     * doctors    → doctor   (JWT)
     * laps       → lap      (JWT)
     * pharmas    → pharma   (JWT)
     * paramedics → paramedic (JWT)
     */
    public function checkGuard($request)
    {
        $guards = [
            'users'      => 'api',        // ✅ غيرنا من 'web' لـ 'api'
            'doctors'    => 'doctor',
            'laps'       => 'lap',
            'pharmas'    => 'pharma',
            'paramedics' => 'paramedic',
        ];

        return $guards[$request->type] ?? 'api';
    }

    /**
     * Redirect بعد Login (Web فقط)
     */
    public function redirect($request)
    {
        $redirects = [
            'users'      => RouteServiceProvider::USER,
            'doctors'    => RouteServiceProvider::DOCTOR,
            'laps'       => RouteServiceProvider::LAP,
            'pharmas'    => RouteServiceProvider::PHARAMAS,
            'paramedics' => RouteServiceProvider::PARAMEDICS,
        ];

        return redirect()->intended($redirects[$request->type] ?? RouteServiceProvider::USER);
    }

    public function getModelFromGuard($guard)
{
    $models = [
        'api'       => \App\Models\User::class,
        'doctor'    => \App\Models\Doctor::class,
        'lap'       => \App\Models\Lap::class,
        'pharma'    => \App\Models\Pharma::class,
        'paramedic' => \App\Models\Paramedic::class,
    ];

    return $models[$guard] ?? \App\Models\User::class;
}
}
