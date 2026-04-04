<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\HandlesQrCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class QrCodeController extends Controller
{
    use HandlesQrCode;

    /**
     * Display the current user's QR code. Generates one if it doesn't exist.
     * GET /api/user/qr
     */
    public function show()
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Generate QR code if missing
        if (!$user->qr_code) {
            $user->update(['qr_code' => Str::random(64)]);
            $loginUrl = config('app.url') . '/api/qr/login/' . $user->qr_code;
            $this->sendQrToEmail($user, $loginUrl, 'patient');
        }

        $loginUrl = config('app.url') . '/api/qr/login/' . $user->qr_code;
        $cacheKey = 'qr_user_' . $user->id;

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $user->qr_code,
        ]);
    }

    /**
     * Regenerate the user's QR code and send it via email.
     * POST /api/user/qr/regenerate
     */
    public function regenerate()
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user->update(['qr_code' => Str::random(64)]);
        
        $loginUrl = config('app.url') . '/api/qr/login/' . $user->qr_code;
        $this->sendQrToEmail($user, $loginUrl, 'patient');

        $cacheKey = 'qr_user_' . $user->id;
        Cache::forget($cacheKey);

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $user->qr_code,
            'message'  => 'New QR Code generated and sent to your email successfully.',
        ]);
    }

    /**
     * Handle login via QR Code scan.
     * GET /api/qr/login/{code}
     * Accepts raw code or full URL (scanner often returns full URL).
     */
    public function loginWithQr(string $code)
    {
        $code = $this->normalizeQrCode($code);
        $user = User::where('qr_code', $code)->first();

        if (!$user) {
            return response()->json([
                'error' => 'Invalid QR Code',
            ], 401);
        }

        // Generate JWT token for the user
        $jwtToken = Auth::guard('api')->login($user);

        return response()->json([
            'message' => 'Logged in successfully via QR',
            'token'   => $jwtToken,
            'type'    => 'users',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

}
