<?php

namespace App\Events;

use App\Models\ComentPublicacion;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RespuestaComentarioEvent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $comentario;

    public function __construct(ComentPublicacion $comentario)
    {
        // Cargamos relaciones necesarias, incluyendo la del comentario padre y sus usuarios
        $this->comentario = $comentario->load([
            'comentPadre.persona.user',
            'comentPadre.institucion.user',
            'persona.user',
            'institucion.user'
        ]);
    }

    public function broadcastOn()
    {
        // Obtenemos el ID del usuario dueño del comentario padre
        $userId = $this->comentario->comentPadre->persona?->user->id 
                ?? $this->comentario->comentPadre->institucion?->user->id;

        if (!$userId) {
            // Por seguridad: si no se encuentra, no hacemos broadcast
            return null;
        }

        return new PrivateChannel("user.{$userId}");
    }

    public function broadcastAs()
    {
        return 'RespuestaComentario'; // El nombre que escucha el frontend
    }

    public function broadcastWith()
    {
        $usuario = $this->comentario->persona?->user 
                ?? $this->comentario->institucion?->user;

        return [
            'comentario' => [
                'id' => $this->comentario->id,
                'publicacion_id' => $this->comentario->publicacion_id,
                'coment_padre_id' => $this->comentario->coment_padre_id,
                'contenido' => $this->comentario->contenido,
                'usuario' => [
                    'id' => $usuario->id ?? null,
                    'nombre' => $usuario->nombre ?? 'Usuario desconocido',
                    'foto' => $usuario?->profile_photo_path 
                              ? asset('storage/'.$usuario->profile_photo_path)
                              : '/storage/profile-photos/default-avatar.webp',
                ],
            ],
        ];
    }
}
