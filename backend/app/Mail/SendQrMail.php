<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class SendQrMail extends Mailable
{
    use Queueable, SerializesModels;

    public $filePath;
    public $nationality_id;
    public $user;
    public $encryptedData;
    public $recipientType;

    public function __construct($filePath, $nationality_id, $user, $encryptedData = null, $recipientType = 'patient')
    {
        $this->filePath = $filePath;
        $this->nationality_id = $nationality_id;
        $this->user = $user;
        $this->encryptedData = $encryptedData;
        $this->recipientType = $recipientType;
    }

    public function build()
    {
        $subject = $this->recipientType === 'doctor'
            ? 'Your Doctor QR Code - HealthHub'
            : 'Your Patient QR Code - HealthHub';

        $mailable = $this->subject($subject)
            ->view('pages.QR_Code.Show')
            ->with([
                'user' => $this->user,
                'nationality_id' => $this->nationality_id,
                'encryptedData' => $this->encryptedData,
            ]);

        // Attach QR file if exists
        $fullPath = Storage::disk('local')->path($this->filePath);

        if ($fullPath && file_exists($fullPath)) {
            $mailable->attach($fullPath, [
                'as' => 'healthhub-qr-code.png',
                'mime' => 'image/png'
            ]);
        }

        return $mailable;
    }
}