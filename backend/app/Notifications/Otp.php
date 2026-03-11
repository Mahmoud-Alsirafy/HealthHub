<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class Otp extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Verification Code - MedLink')
            ->greeting("Hello {$notifiable->name},")
            ->line("To continue with your authentication, please use the following One-Time Password (OTP):")
            ->line("**{$notifiable->code}**")
            ->line("This code is valid for **15 minutes**.")
            ->line("For your security, please do not share this code with anyone.")
            ->line("If you did not attempt to sign in, please ignore this message.")
            ->salutation("MedLink Security Team");
    }
}