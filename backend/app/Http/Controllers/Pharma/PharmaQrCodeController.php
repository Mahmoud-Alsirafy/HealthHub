<?php

namespace App\Http\Controllers\Pharma;

use App\Http\Controllers\Controller;
use App\Models\Pharma;
use App\Traits\HandlesQrCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PharmaQrCodeController extends Controller
{
    use HandlesQrCode;

    public function show()
    {
        $pharma = Auth::guard('pharma')->user();

        if (!$pharma) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$pharma->qr_code) {
            $pharma->update(['qr_code' => Str::random(64)]);
            $loginUrl = config('app.url') . '/api/qr/pharma/login/' . $pharma->qr_code;
            $this->sendQrToEmail($pharma, $loginUrl, 'pharma');
        }

        $loginUrl = config('app.url') . '/api/qr/pharma/login/' . $pharma->qr_code;
        $cacheKey = 'qr_pharma_' . $pharma->id;

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $pharma->qr_code,
        ]);
    }

    public function regenerate()
    {
        $pharma = Auth::guard('pharma')->user();

        if (!$pharma) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $pharma->update(['qr_code' => Str::random(64)]);
        
        $loginUrl = config('app.url') . '/api/qr/pharma/login/' . $pharma->qr_code;
        $this->sendQrToEmail($pharma, $loginUrl, 'pharma');

        $cacheKey = 'qr_pharma_' . $pharma->id;
        Cache::forget($cacheKey);

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $pharma->qr_code,
            'message'  => 'New QR Code generated and sent to your email successfully.',
        ]);
    }

    public function loginWithQr(string $code)
    {
        $code = $this->normalizeQrCode($code);
        $pharma = Pharma::where('qr_code', $code)->first();

        if (!$pharma) {
            return response()->json(['error' => 'Invalid QR Code'], 401);
        }

        $token = Auth::guard('pharma')->login($pharma);

        return response()->json([
            'message' => 'Logged in successfully via QR',
            'token'   => $token,
            'type'    => 'pharmas',
            'user'    => [
                'id'    => $pharma->id,
                'name'  => $pharma->name,
                'email' => $pharma->email,
            ],
        ]);
    }
}
