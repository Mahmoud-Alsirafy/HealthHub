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
    public $encryptedData; // 🆕 البيانات المشفرة اللي في QR

    public function __construct($filePath, $nationality_id, $user, $encryptedData = null)
    {
        $this->filePath = $filePath;
        $this->nationality_id = $nationality_id;
        $this->user = $user;
        $this->encryptedData = $encryptedData; // 🆕 نحتفظ بيها لو حبيت تستخدمها في الـ view
    }

    public function build()
    {
        return $this->subject('QR Code للمريض')
            ->view('pages.QR_Code.Show')
            ->with([
                'user' => $this->user,
                'nationality_id' => $this->nationality_id,
                'encryptedData' => $this->encryptedData, // 🆕 نبعثها للواجهة
            ])
            ->attach(storage_path('app/' . $this->filePath));
    }
}
