<?php

namespace App\Notifications;

use App\Models\Like;
use Illuminate\Notifications\Notification;

class LikeCreadoNotification extends Notification
{
    public $like;

    public function __construct(Like $like)
    {
        $this->like = $like;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        $usuario = $this->like->persona->user
            ?? $this->like->institucion->user
            ?? null;

        return [
            'like_id' => $this->like->id,
            'publicacion_id' => $this->like->target_id,
            'target_tipo' => $this->like->target_tipo,
            'usuario' => [
                'id' => $usuario->id ?? null,
                'nombre' => $usuario->nombre ?? $usuario->name ?? 'Usuario desconocido',
                'foto' => $usuario->profile_photo_path
                    ? asset('storage/' . $usuario->profile_photo_path)
                    : '/storage/profile-photos/default-avatar.webp',
            ],
            'tipo' => 'like',
            'created_at' => $this->like->created_at,
        ];
    }


    public function toArray($notifiable)
    {
        $usuario = $this->like->persona->user
            ?? $this->like->institucion->user
            ?? null;

        // Aplanar los datos del usuario para enviar a JS
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
            'like_id' => $this->like->id,
            'publicacion_id' => $this->like->target_id,
            'usuario' => $usuarioArray,
            'created_at' => $this->like->created_at,
        ];
    }

}
