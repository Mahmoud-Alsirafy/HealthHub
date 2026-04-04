<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Traits\HandlesQrCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class LabQrCodeController extends Controller
{
    use HandlesQrCode;

    public function show()
    {
        $lab = Auth::guard('lab')->user();

        if (!$lab) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$lab->qr_code) {
            $lab->update(['qr_code' => Str::random(64)]);
            $loginUrl = config('app.url') . '/api/qr/lab/login/' . $lab->qr_code;
            $this->sendQrToEmail($lab, $loginUrl, 'lab');
        }

        $loginUrl = config('app.url') . '/api/qr/lab/login/' . $lab->qr_code;
        $cacheKey = 'qr_lab_' . $lab->id;

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $lab->qr_code,
        ]);
    }

    public function regenerate()
    {
        $lab = Auth::guard('lab')->user();

        if (!$lab) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $lab->update(['qr_code' => Str::random(64)]);
        
        $loginUrl = config('app.url') . '/api/qr/lab/login/' . $lab->qr_code;
        $this->sendQrToEmail($lab, $loginUrl, 'lab');

        $cacheKey = 'qr_lab_' . $lab->id;
        Cache::forget($cacheKey);

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $lab->qr_code,
            'message'  => 'New QR Code generated and sent to your email successfully.',
        ]);
    }

    public function loginWithQr(string $code)
    {
        $code = $this->normalizeQrCode($code);
        $lab = Lab::where('qr_code', $code)->first();

        if (!$lab) {
            return response()->json(['error' => 'Invalid QR Code'], 401);
        }

        $token = Auth::guard('lab')->login($lab);

        return response()->json([
            'message' => 'Logged in successfully via QR',
            'token'   => $token,
            'type'    => 'labs',
            'user'    => [
                'id'    => $lab->id,
                'name'  => $lab->name,
                'email' => $lab->email,
            ],
        ]);
    }
}
