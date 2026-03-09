<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class Otp
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
{
    // لو API مش بيعمل redirect ❌
    if ($request->expectsJson()) {
        return $next($request);
    }

    $user = Auth::user();

    if (Auth::check() && $user->code) {
        $type = strtolower(\Illuminate\Support\Str::plural(class_basename($user)));
        if (!$request->is('otp*') && !$request->is('*/otp*')) {
            return redirect()->route('otp.index', ['type' => $type, 'id' => $user->id]);
        }
    }

    return $next($request);
}
}
