<?php

namespace App\Http\Middleware;

use Closure;

use Illuminate\Http\Request;
use App\Providers\RouteServiceProvider;

class RedirectIfAuthenticated
{

    public function handle(Request $request, Closure $next)
    {
        if(auth('users')->check()){
            return redirect(RouteServiceProvider::USER);
        }
        if(auth('doctors')->check()){
            return redirect(RouteServiceProvider::DOCTOR);
        }
        if(auth('laps')->check()){
            return redirect(RouteServiceProvider::LAP);
        }
        if(auth('pharmas')->check()){
            return redirect(RouteServiceProvider::PHARAMAS);
        }
        if(auth('paramedics')->check()){
            return redirect(RouteServiceProvider::PARAMEDICS);
        }

        return $next($request);
    }
}
