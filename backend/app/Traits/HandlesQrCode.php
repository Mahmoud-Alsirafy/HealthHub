<?php

namespace App\Traits;

use App\Mail\SendQrMail;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

trait HandlesQrCode
{
    /**
     * Extract actual QR token from raw code or full URL.
     */
    protected function normalizeQrCode(string $code): string
    {
        $code = trim($code);
        if (str_contains($code, '/qr/login/') || str_contains($code, '/qr/doctor/login/')) {
            $code = basename(parse_url($code, PHP_URL_PATH) ?: $code);
        }
        return $code;
    }

    /**
     * Generate Base64 image string for the QR code, with optional caching for better performance.
     *
     * @param string      $loginUrl
     * @param string|null $cacheKey
     * @param int         $cacheSeconds Default 24 hours (86400 seconds)
     * @return string
     */
    protected function generateQrBase64(string $loginUrl, ?string $cacheKey = null, int $cacheSeconds = 86400): string
    {
        $generateClosure = function () use ($loginUrl) {
            $writer = new PngWriter();
            $qrCode = QrCode::create($loginUrl)
                ->setSize(300)
                ->setMargin(10);
            $result = $writer->write($qrCode);
            return 'data:image/png;base64,' . base64_encode($result->getString());
        };

        if ($cacheKey) {
            return Cache::remember($cacheKey, $cacheSeconds, $generateClosure);
        }

        return $generateClosure();
    }

    /**
     * Helper: Save QR image to disk and send via email.
     */
    protected function sendQrToEmail($user, string $loginUrl, string $role = 'patient'): void
    {
        $writer = new PngWriter();
        $qrCode = QrCode::create($loginUrl)
            ->setSize(300)
            ->setMargin(10);

        $result = $writer->write($qrCode);

        $fileName = 'qr_' . $role . '_' . $user->id . '_' . time() . '.png';
        $relativePath = 'QR/' . $fileName;

        if (!Storage::disk('local')->exists('QR')) {
            Storage::disk('local')->makeDirectory('QR');
        }

        Storage::disk('local')->put($relativePath, $result->getString());

        $nationalId = $user->national_id ?? '';

        Mail::to($user->email)->send(new SendQrMail(
            $relativePath,
            $nationalId,
            $user->name,
            $user->qr_code,
            $role
        ));
    }
}
