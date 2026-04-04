<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Traits\HandlesQrCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminQrCodeController extends Controller
{
    use HandlesQrCode;

    public function show()
    {
        $admin = Auth::guard('admin')->user();

        if (!$admin) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$admin->qr_code) {
            $admin->update(['qr_code' => Str::random(64)]);
            $loginUrl = config('app.url') . '/api/qr/admin/login/' . $admin->qr_code;
            $this->sendQrToEmail($admin, $loginUrl, 'admin');
        }

        $loginUrl = config('app.url') . '/api/qr/admin/login/' . $admin->qr_code;
        $cacheKey = 'qr_admin_' . $admin->id;

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $admin->qr_code,
        ]);
    }

    public function regenerate()
    {
        $admin = Auth::guard('admin')->user();

        if (!$admin) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $admin->update(['qr_code' => Str::random(64)]);
        
        $loginUrl = config('app.url') . '/api/qr/admin/login/' . $admin->qr_code;
        $this->sendQrToEmail($admin, $loginUrl, 'admin');

        $cacheKey = 'qr_admin_' . $admin->id;
        Cache::forget($cacheKey);

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $admin->qr_code,
            'message'  => 'New QR Code generated and sent to your email successfully.',
        ]);
    }

    public function loginWithQr(string $code)
    {
        $code = $this->normalizeQrCode($code);
        $admin = Admin::where('qr_code', $code)->first();

        if (!$admin) {
            return response()->json(['error' => 'Invalid QR Code'], 401);
        }

        $token = Auth::guard('admin')->login($admin);

        return response()->json([
            'message' => 'Logged in successfully via QR',
            'token'   => $token,
            'type'    => 'admins',
            'user'    => [
                'id'    => $admin->id,
                'name'  => $admin->name,
                'email' => $admin->email,
                'type'  => $admin->type,
            ],
        ]);
    }
}
