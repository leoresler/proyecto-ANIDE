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

        // Aquí enviamos la notificación al receptor (institución propietaria de la publicación)
        $receptor = $comentario->publicacion->institucion->user;
        $receptor->notify(new ComentarioCreadoNotification($comentario)); // Enviamos la notificación
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
        // Cargar relaciones posibles
        $this->comentario->load([
            'persona.user',      // usuario tipo persona
            'institucion.user',  // usuario tipo institución
        ]);

        // Determinar el usuario que hizo el comentario
        $usuario = null;

        if ($this->comentario->persona && $this->comentario->persona->user) {
            $usuario = $this->comentario->persona->user;
        } elseif ($this->comentario->institucion && $this->comentario->institucion->user) {
            $usuario = $this->comentario->institucion->user;
        }

        return [
            'comentario' => [
                'id' => $this->comentario->id,
                'contenido' => $this->comentario->contenido,
                'publicacion_id' => $this->comentario->publicacion_id,

                'usuario' => $usuario ? [
                    'id' => $usuario->id,
                    'name' => $usuario->nombre ?? $usuario->name ?? 'Sin nombre',
                ] : [
                    'id' => null,
                    'name' => 'Usuario desconocido',
                ],

                'created_at' => $this->comentario->created_at,
            ],
        ];
    }

}
