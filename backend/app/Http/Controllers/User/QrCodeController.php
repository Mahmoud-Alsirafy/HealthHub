<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Mail\SendQrMail;

class QrCodeController extends Controller
{
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
            $this->sendQrToEmail($user);
        }

        return response()->json([
            'qr_image' => $this->generateQrBase64($user->qr_code),
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
        $this->sendQrToEmail($user);

        return response()->json([
            'qr_image' => $this->generateQrBase64($user->qr_code),
            'qr_code'  => $user->qr_code,
            'message'  => 'New QR Code generated and sent to your email successfully.',
        ]);
    }

    /**
     * Handle login via QR Code scan.
     * GET /api/qr/login/{code}
     */
    public function loginWithQr(string $code)
    {
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

    /**
     * Helper: Generate Base64 image string for the QR code.
     */
    private function generateQrBase64(string $code): string
    {
        $loginUrl = config('app.url') . '/api/qr/login/' . $code;

        $writer = new PngWriter();
        $qrCode = QrCode::create($loginUrl)
            ->setSize(300)
            ->setMargin(10);

        $result = $writer->write($qrCode);

        return 'data:image/png;base64,' . base64_encode($result->getString());
    }

    /**
     * Helper: Save QR image to disk and send via email.
     */
    private function sendQrToEmail($user)
    {
        $loginUrl = config('app.url') . '/api/qr/login/' . $user->qr_code;

        $writer = new PngWriter();
        $qrCode = QrCode::create($loginUrl)
            ->setSize(300)
            ->setMargin(10);

        $result = $writer->write($qrCode);
        
        $fileName = 'qr_' . $user->id . '_' . time() . '.png';
        $relativePath = 'QR/' . $fileName; // storage/app/QR/...

        // Ensure QR directory exists
        if (!Storage::disk('local')->exists('QR')) {
            Storage::disk('local')->makeDirectory('QR');
        }

        // Save the image
        Storage::disk('local')->put($relativePath, $result->getString());

        // Send Email
        Mail::to($user->email)->send(new SendQrMail(
            $relativePath, 
            $user->national_id, 
            $user->name, 
            $user->qr_code
        ));
    }
}
