<?php

namespace App\Events;

use App\Models\ComentPublicacion;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Notifications\ComentarioCreadoNotification;
use Illuminate\Support\Facades\Notification;

class ComentarioCreado implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $comentario;
    public $receptorId;

    public function __construct(ComentPublicacion $comentario)
    {
        $this->comentario = $comentario;

        // Siempre hay una institución propietaria de la publicación
        $this->receptorId = $comentario->publicacion->institucion->user->id;

         $usuarioQueComento = $comentario->persona->user ?? $comentario->institucion->user;
    
        if ($usuarioQueComento && $usuarioQueComento->id !== $this->receptorId) {
            $receptor = $comentario->publicacion->institucion->user;
            $receptor->notify(new ComentarioCreadoNotification($comentario));
        }
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel('user.' . $this->receptorId),
        ];
    }

    public function broadcastAs()
    {
        return 'ComentarioCreado';
    }

    public function broadcastWith()
    {
        $this->comentario->load([
            'persona.user',
            'institucion.user',
        ]);

        // Determinar el usuario que hizo el comentario
        $usuario = $this->comentario->persona->user
            ?? $this->comentario->institucion->user
            ?? null;

        // Foto del usuario (misma lógica que en toDatabase)
        $usuario_foto = $usuario && $usuario->profile_photo_path
            ? asset('storage/' . $usuario->profile_photo_path)
            : ('/storage/profile-photos/default-avatar.webp');

        return [
            'comentario' => [
                'id' => $this->comentario->id,
                'contenido' => $this->comentario->contenido,
                'publicacion_id' => $this->comentario->publicacion_id,

                'usuario' => [
                    'id' => $usuario->id ?? null,
                    'name' => $usuario->nombre ?? $usuario->name ?? 'Sin nombre',
                    'foto' => $usuario_foto, 
                ],

                'created_at' => $this->comentario->created_at,
            ],
        ];
    }


}
