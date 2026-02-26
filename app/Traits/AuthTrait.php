<?php

namespace App\Traits;

use App\Providers\RouteServiceProvider;

trait AuthTrait
{
    public function checkGuard($request)
    {
        if ($request->type == 'users') {
            $guardName = 'web';
        } elseif ($request->type == 'doctors') {
            $guardName = 'doctor';
        } elseif ($request->type == 'laps') {
            $guardName = 'lap';
        }elseif ($request->type == 'pharmas') {
            $guardName = 'pharma';
        } else {
            $guardName = 'paramedic';
        }

        return $guardName;
    }

    public function redirect($request)
    {
        if ($request->type == 'users') {
            return redirect()->intended(RouteServiceProvider::USER);
        } elseif ($request->type == 'doctors') {
            return redirect()->intended(RouteServiceProvider::DOCTOR);
        } elseif ($request->type == 'laps') {
            return redirect()->intended(RouteServiceProvider::LAP);
        } elseif ($request->type == 'pharmas') {
            return redirect()->intended(RouteServiceProvider::PHARAMAS);
        } else {
            return redirect()->intended(RouteServiceProvider::PARAMEDICS);
        }

    }
}
