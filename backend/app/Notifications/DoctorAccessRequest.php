<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DoctorAccessRequest extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private $doctor,
        private string $otp
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Medical Record Access Request - MedLink')
            ->greeting("Hello {$notifiable->name},")
            ->line("Dr. **{$this->doctor->name}** ({$this->doctor->specialty}) has requested temporary access to your medical record.")
            ->line("If you are currently with the doctor, please provide them with the following verification code:")
            ->line("**{$this->otp}**")
            ->line("This code will expire in **15 minutes** for security reasons.")
            ->line("If you did not request this access or are not currently visiting this doctor, please ignore this email.")
            ->salutation("MedLink Healthcare Team");
    }
}