<?php

namespace App\Notifications;

use App\Models\ComentPublicacion;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class ComentarioCreadoNotification extends Notification
{
    public $comentario;

    public function __construct(ComentPublicacion $comentario)
    {
        $this->comentario = $comentario;
    }

    // Método que se llama para guardar la notificación en la base de datos
    public function toDatabase($notifiable)
    {
        return [
            'comentario_id' => $this->comentario->id,
            'contenido' => $this->comentario->contenido,
            'publicacion_id' => $this->comentario->publicacion_id,
            'usuario' => $this->comentario->persona ? $this->comentario->persona->user->nombre : 'Usuario desconocido',
            'created_at' => $this->comentario->created_at,
        ];
    }

    // Método para enviar la notificación por canales adicionales (puedes agregar más si lo necesitas)
    public function via($notifiable)
    {
        return ['database']; // Solo la guardamos en la base de datos
    }
}
