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
    /** @var string|null 'patient' | 'doctor' - for subject and view */
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
            ? 'QR Code للطبيب / Doctor QR Code'
            : 'QR Code للمريض';

        $mailable = $this->subject($subject)
            ->view('pages.QR_Code.Show')
            ->with([
                'user' => $this->user,
                'nationality_id' => $this->nationality_id,
                'encryptedData' => $this->encryptedData,
            ]);

        // Attach only if file exists (avoids failure when path is wrong or file missing)
        $fullPath = Storage::disk('local')->path($this->filePath);
        if ($fullPath && file_exists($fullPath)) {
            $mailable->attach($fullPath, ['as' => 'qr_code.png', 'mime' => 'image/png']);
        }

        return $mailable;
    }
}
