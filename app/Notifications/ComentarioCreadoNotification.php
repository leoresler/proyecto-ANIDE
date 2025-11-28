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
        $usuario = $this->comentario->persona->user
            ?? $this->comentario->institucion->user
            ?? null;

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
            'comentario_id' => $this->comentario->id,
            'publicacion_id' => $this->comentario->publicacion_id,
            'contenido' => $this->comentario->contenido,
            'usuario' => $usuarioArray, // <<--- aquí el usuario aplanado
            'tipo' => 'comentario',
            'created_at' => $this->comentario->created_at,
        ];
    }


    public function toBroadcast($notifiable)
    {
        $usuario = $this->comentario->persona->user 
            ?? $this->comentario->institucion->user 
            ?? null;

        \Log::info("ComentarioCreadoNotification usuario:", ['usuario' => $usuario]);

        return [
            'id' => $this->comentario->id,
            'type' => 'App\\Notifications\\ComentarioCreadoNotification',
            'created_at' => $this->comentario->created_at,

            'data' => [
                'comentario_id' => $this->comentario->id,
                'contenido' => $this->comentario->contenido,
                'publicacion_id' => $this->comentario->publicacion_id,
                'tipo' => 'comentario',
                'usuario' => [
                    'nombre' => $usuario->nombre ?? $usuario->name ?? 'Usuario desconocido',
                    'foto' => $usuario->profile_photo_path
                        ? asset('storage/' . $usuario->profile_photo_path)
                        : '/storage/profile-photos/default-avatar.webp',
                ],
            ],
        ];
    }

    public function toArray($notifiable)
    {
        $usuario = $this->comentario->persona->user
            ?? $this->comentario->institucion->user
            ?? null;

        // Aplanar datos para que frontend siempre vea notif.data.usuario
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
            'comentario_id' => $this->comentario->id,
            'publicacion_id' => $this->comentario->publicacion_id,
            'contenido' => $this->comentario->contenido,
            'usuario' => $usuarioArray, // <<--- aquí va
            'tipo' => 'comentario',
            'created_at' => $this->comentario->created_at,
        ];
    }




    // Método para enviar la notificación por canales adicionales (puedes agregar más si lo necesitas)
    public function via($notifiable)
    {
        return ['database', 'broadcast']; 
    }
}
