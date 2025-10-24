<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailNotification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends VerifyEmailNotification
{
    /**
     * Obtener el mail que se envía al usuario.
     */
    public function toMail($notifiable)
    {
        // Generar la URL de verificación firmada
        $verificationUrl = $this->verificationUrl($notifiable);

        // Podés personalizar todo el contenido del email acá:
        return (new MailMessage)
            ->subject('Verificá tu cuenta en EDUQUÉN')
            ->greeting('¡Hola ' . $notifiable->nombre . '!')
            ->line('Gracias por registrarte en EDUQUÉN. Solo falta un paso:')
            ->action('Verificar mi correo', $verificationUrl)
            ->line('Si no creaste esta cuenta, podés ignorar este mensaje.')
            ->salutation('Saludos, el equipo de EDUQUÉN');
    }

    /**
     * Generar la URL firmada para verificar el correo.
     */
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );
    }
}
