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
     * labs       → lab      (JWT)
     * pharmas    → pharma   (JWT)
     * paramedics → paramedic (JWT)
     */
    public function checkGuard($request)
    {
        $guards = [
            'users'      => 'api',        // ✅ غيرنا من 'web' لـ 'api'
            'doctors'    => 'doctor',
            'labs'       => 'lab',
            'pharmas'    => 'pharma',
            'paramedics' => 'paramedic',
            'admins' => 'admin',
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
            'labs'       => RouteServiceProvider::LAB,
            'pharmas'    => RouteServiceProvider::PHARAMAS,
            'paramedics' => RouteServiceProvider::PARAMEDICS,
            'admins' => RouteServiceProvider::ADMINS,
        ];

        return redirect()->intended($redirects[$request->type] ?? RouteServiceProvider::USER);
    }

    public function getModelFromGuard($guard)
{
    $models = [
        'api'       => \App\Models\User::class,
        'doctor'    => \App\Models\Doctor::class,
        'lab'       => \App\Models\Lab::class,
        'pharma'    => \App\Models\Pharma::class,
        'paramedic' => \App\Models\Paramedic::class,
        'admin' => \App\Models\Admin::class,
    ];

    return $models[$guard] ?? \App\Models\User::class;
}
}
