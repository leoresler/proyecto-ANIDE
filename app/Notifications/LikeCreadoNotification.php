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

            'usuario_nombre' => $usuario->nombre ?? $usuario->name ?? 'Usuario desconocido',
            'usuario_foto' => $usuario->profile_photo_path
                ? asset('storage/' . $usuario->profile_photo_path)
                : '/images/default-user.png',

            'created_at' => $this->like->created_at,
        ];
    }
}
