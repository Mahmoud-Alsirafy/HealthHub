<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Mail\SendQrMail;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DoctorQrCodeController extends Controller
{
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
            $this->sendQrToEmail($doctor);
        }

        return response()->json([
            'qr_image' => $this->generateQrBase64($doctor->qr_code),
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
        $this->sendQrToEmail($doctor);

        return response()->json([
            'qr_image' => $this->generateQrBase64($doctor->qr_code),
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

    private function normalizeQrCode(string $code): string
    {
        $code = trim($code);
        if (str_contains($code, '/qr/login/') || str_contains($code, '/qr/doctor/login/')) {
            $code = basename(parse_url($code, PHP_URL_PATH) ?: $code);
        }
        return $code;
    }

    protected function generateQrBase64(string $code): string
    {
        $loginUrl = config('app.url') . '/api/qr/doctor/login/' . $code;

        $writer = new PngWriter();
        $qrCode = QrCode::create($loginUrl)
            ->setSize(300)
            ->setMargin(10);

        $result = $writer->write($qrCode);

        return 'data:image/png;base64,' . base64_encode($result->getString());
    }

    private function sendQrToEmail(Doctor $doctor): void
    {
        $loginUrl = config('app.url') . '/api/qr/doctor/login/' . $doctor->qr_code;

        $writer = new PngWriter();
        $qrCode = QrCode::create($loginUrl)
            ->setSize(300)
            ->setMargin(10);

        $result = $writer->write($qrCode);

        $fileName = 'qr_doctor_' . $doctor->id . '_' . time() . '.png';
        $relativePath = 'QR/' . $fileName;

        if (!Storage::disk('local')->exists('QR')) {
            Storage::disk('local')->makeDirectory('QR');
        }

        Storage::disk('local')->put($relativePath, $result->getString());

        Mail::to($doctor->email)->send(new SendQrMail(
            $relativePath,
            $doctor->national_id ?? '',
            $doctor->name,
            $doctor->qr_code,
            'doctor'
        ));
    }
}
