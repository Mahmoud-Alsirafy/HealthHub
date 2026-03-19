<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminTypeMiddleware
{
    public function handle(Request $request, Closure $next, string $type)
    {
        $admin = auth('admin')->user();

        if (!$admin || $admin->type !== $type) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Access denied.',
            ], 403);
        }

        return $next($request);
    }
}
