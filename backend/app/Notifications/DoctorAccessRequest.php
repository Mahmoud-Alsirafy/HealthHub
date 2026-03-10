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
            ->subject('طلب وصول لملفك الطبي - MedLink')
            ->greeting("مرحباً {$notifiable->name}")
            ->line("الدكتور **{$this->doctor->name}** ({$this->doctor->specialty}) يطلب الوصول لملفك الطبي.")
            ->line("إذا كنت أمامه الآن، أعطه هذا الكود:")
            ->line("## {$this->otp}")
            ->line("⏱ الكود صالح لمدة **15 دقيقة** فقط.")
            ->line("إذا لم تكن في عيادة هذا الدكتور، **تجاهل هذا الإيميل**.")
            ->salutation("فريق MedLink");
    }
}
