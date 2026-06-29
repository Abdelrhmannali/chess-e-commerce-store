<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable)
    {
        $frontend = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $resetUrl = $frontend.'/reset-password?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        return (new MailMessage)
            ->subject('إعادة تعيين كلمة المرور - بيدق')
            ->view('emails.reset-password', [
                'resetUrl' => $resetUrl,
                'userName' => $notifiable->name ?? 'عميلنا الكريم',
            ]);
    }
}
