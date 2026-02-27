<?php

namespace App\Traits;

use App\Providers\RouteServiceProvider;

trait AuthTrait
{
    public function checkGuard($request)
    {
        $guards = [
            'users' => 'web',
            'doctors' => 'doctor',
            'laps' => 'lap',
            'pharmas' => 'pharma',
            'paramedics' => 'paramedic',
        ];

        return $guards[$request->type] ?? 'web';
    }

    public function redirect($request)
    {
        $redirects = [
            'users' => RouteServiceProvider::USER,
            'doctors' => RouteServiceProvider::DOCTOR,
            'laps' => RouteServiceProvider::LAP,
            'pharmas' => RouteServiceProvider::PHARAMAS,
            'paramedics' => RouteServiceProvider::PARAMEDICS,
        ];

        return redirect()->intended($redirects[$request->type] ?? RouteServiceProvider::USER);
    }
}
