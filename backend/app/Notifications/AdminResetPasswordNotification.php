<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        $email = urlencode($notifiable->getEmailForPasswordReset());
        $url = "{$frontendUrl}/?action=reset-password&token={$this->token}&email={$email}";

        return (new MailMessage)
            ->subject('Reset Your Atlas & Isle Admin Password')
            ->greeting('Hello, ' . ($notifiable->name ?: 'Administrator'))
            ->line('You are receiving this email because a password reset request was initiated for your Atlas & Isle administrator account.')
            ->action('Reset Admin Password', $url)
            ->line('This password reset link will expire in ' . config('auth.passwords.users.expire', 60) . ' minutes.')
            ->line('If you did not request a password reset, no further action is required; your account credentials remain unchanged.');
    }
}
