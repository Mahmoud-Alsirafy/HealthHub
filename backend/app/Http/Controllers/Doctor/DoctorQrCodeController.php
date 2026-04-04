<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Traits\HandlesQrCode;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class DoctorQrCodeController extends Controller
{
    use HandlesQrCode;

    /**
     * Display the current doctor's QR code. Generates one if it doesn't exist.
     * GET /api/doctor/qr
     */
    public function show()
    {
        $doctor = Auth::guard('doctor')->user();

        if (!$doctor) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$doctor->qr_code) {
            $doctor->update(['qr_code' => Str::random(64)]);
            $loginUrl = config('app.url') . '/api/qr/doctor/login/' . $doctor->qr_code;
            $this->sendQrToEmail($doctor, $loginUrl, 'doctor');
        }

        $loginUrl = config('app.url') . '/api/qr/doctor/login/' . $doctor->qr_code;
        $cacheKey = 'qr_doctor_' . $doctor->id;

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $doctor->qr_code,
        ]);
    }

    /**
     * Regenerate the doctor's QR code and send it via email.
     * POST /api/doctor/qr/regenerate
     */
    public function regenerate()
    {
        $doctor = Auth::guard('doctor')->user();

        if (!$doctor) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctor->update(['qr_code' => Str::random(64)]);
        
        $loginUrl = config('app.url') . '/api/qr/doctor/login/' . $doctor->qr_code;
        $this->sendQrToEmail($doctor, $loginUrl, 'doctor');

        $cacheKey = 'qr_doctor_' . $doctor->id;
        Cache::forget($cacheKey);

        return response()->json([
            'qr_image' => $this->generateQrBase64($loginUrl, $cacheKey),
            'qr_code'  => $doctor->qr_code,
            'message'  => 'New QR Code generated and sent to your email successfully.',
        ]);
    }

    /**
     * Handle doctor login via QR Code scan.
     * GET /api/qr/doctor/login/{code}
     * Accepts raw code or full URL (scanner often returns full URL).
     */
    public function loginWithQr(string $code)
    {
        $code = $this->normalizeQrCode($code);
        $doctor = Doctor::where('qr_code', $code)->first();

        if (!$doctor) {
            return response()->json(['error' => 'Invalid QR Code'], 401);
        }

        $token = Auth::guard('doctor')->login($doctor);

        return response()->json([
            'message' => 'Logged in successfully via QR',
            'token'   => $token,
            'type'    => 'doctors',
            'user'    => [
                'id'        => $doctor->id,
                'name'      => $doctor->name,
                'email'     => $doctor->email,
                'specialty' => $doctor->specialty,
            ],
        ]);
    }

}
