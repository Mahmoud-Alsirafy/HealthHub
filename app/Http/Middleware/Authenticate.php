<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Support\Facades\Request;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        if (!$request->expectsJson()) {
            if (Request::is(app()->getLocale() . '/user')) {
                return route('selection');
            }

            if (Request::is(app()->getLocale() . '/doctor')) {
                return route('selection');
            }

            if (Request::is(app()->getLocale() . '/lap')) {
                return route('selection');
            }
            if (Request::is(app()->getLocale() . '/pharma')) {
                return route('selection');
            }


            return route('selection');
        }

        return null;
    }
}
