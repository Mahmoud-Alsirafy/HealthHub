<?php

namespace App\Http\Controllers\Paramedic;

use App\Http\Controllers\Controller;
use App\Models\Paramedic;
use App\Traits\HandlesQrCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ParamedicQrCodeController extends Controller
{
    use HandlesQrCode;

    public function show()
    {
        $paramedic = Auth::guard('paramedic')->user();

        if (!$paramedic) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$paramedic->qr_code) {
            $paramedic->update(['qr_code' => Str::random(64)]);
            $loginUrl = config('app.url') . '/api/qr/paramedic/login/' . $paramedic->qr_code;
            $this->sendQrToEmail($paramedic, $loginUrl, 'paramedic');
        }

        $loginUrl = config('app.url') . '/api/qr/paramedic/login/' . $paramedic->qr_code;
        $cacheKey = 'qr_paramedic_' . $paramedic->id;

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $paramedic->qr_code,
        ]);
    }

    public function regenerate()
    {
        $paramedic = Auth::guard('paramedic')->user();

        if (!$paramedic) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $paramedic->update(['qr_code' => Str::random(64)]);
        
        $loginUrl = config('app.url') . '/api/qr/paramedic/login/' . $paramedic->qr_code;
        $this->sendQrToEmail($paramedic, $loginUrl, 'paramedic');

        $cacheKey = 'qr_paramedic_' . $paramedic->id;
        Cache::forget($cacheKey);

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $paramedic->qr_code,
            'message'  => 'New QR Code generated and sent to your email successfully.',
        ]);
    }

    public function loginWithQr(string $code)
    {
        $code = $this->normalizeQrCode($code);
        $paramedic = Paramedic::where('qr_code', $code)->first();

        if (!$paramedic) {
            return response()->json(['error' => 'Invalid QR Code'], 401);
        }

        $token = Auth::guard('paramedic')->login($paramedic);

        return response()->json([
            'message' => 'Logged in successfully via QR',
            'token'   => $token,
            'type'    => 'paramedics',
            'user'    => [
                'id'    => $paramedic->id,
                'name'  => $paramedic->name,
                'email' => $paramedic->email,
            ],
        ]);
    }
}
