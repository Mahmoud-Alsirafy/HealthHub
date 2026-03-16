<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Providers\RouteServiceProvider;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards)
    {
        // لو API request → مش بيعمل redirect
        if ($request->expectsJson()) {
            return $next($request);
        }

        // Web: تحقق من كل guard وعمل redirect لو مسجل
        if (auth('api')->check()) {
            return redirect(RouteServiceProvider::USER);
        }
        if (auth('doctor')->check()) {
            return redirect(RouteServiceProvider::DOCTOR);
        }
        if (auth('lab')->check()) {
            return redirect(RouteServiceProvider::LAB);
        }
        if (auth('pharma')->check()) {
            return redirect(RouteServiceProvider::PHARAMAS);
        }
        if (auth('paramedic')->check()) {
            return redirect(RouteServiceProvider::PARAMEDICS);
        }

        return $next($request);
    }
}
