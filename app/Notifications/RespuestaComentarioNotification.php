<?php

namespace App\Notifications;

use App\Models\ComentPublicacion;
use Illuminate\Notifications\Notification;

class RespuestaComentarioNotification extends Notification
{
    public $respuesta;

    public function __construct(ComentPublicacion $respuesta)
    {
        $this->respuesta = $respuesta;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        $usuario = $this->respuesta->persona->user 
                ?? $this->respuesta->institucion->user 
                ?? null;

        // Aplanar datos del usuario
        $usuarioArray = $usuario ? [
            'id' => $usuario->id,
            'nombre' => $usuario->nombre ?? $usuario->name,
            'foto' => $usuario->profile_photo_path
                ? asset('storage/' . $usuario->profile_photo_path)
                : '/storage/profile-photos/default-avatar.webp',
        ] : [
            'id' => null,
            'nombre' => 'Usuario desconocido',
            'foto' => '/storage/profile-photos/default-avatar.webp',
        ];

        return [
            'comentario_id' => $this->respuesta->id,
            'publicacion_id' => $this->respuesta->publicacion_id,
            'contenido' => $this->respuesta->contenido,
            'usuario' => $usuarioArray, // <<-- usuario aplanado
            'tipo' => 'respuesta',
            'created_at' => $this->respuesta->created_at,
        ];
    }
}
