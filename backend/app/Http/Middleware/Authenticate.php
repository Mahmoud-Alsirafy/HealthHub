<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        // لو API request → مش بيعمل redirect، بيرجع 401
        if ($request->expectsJson()) {
            return null;
        }

        // لو Web request → روح صفحة الاختيار
        return route('selection');
    }
}