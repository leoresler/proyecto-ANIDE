<?php

namespace App\Events;

use App\Models\Mensaje;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MensajeEnviado implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $mensaje;
    public $receptorId;

    public function __construct(Mensaje $mensaje)
    {
        $this->mensaje = $mensaje;

        $chat = $mensaje->chat;

        // Obtener IDs de usuario de persona e institución.
        $userPersona = $chat->persona?->user?->id;
        $userInstitucion = $chat->institucion?->user?->id;

        // El que envió el mensaje:
        $emisorId = $mensaje->emisor_id;

        // El receptor es el otro:
        if ($userPersona === $emisorId) {
            $this->receptorId = $userInstitucion;
        } else {
            $this->receptorId = $userPersona;
        }
    }

    public function broadcastOn()
    {
        return [
            // Canal del chat: para actualizar ChatDetalle.jsx
            new PrivateChannel('chat.' . $this->mensaje->chat_id),

            // Canal del usuario receptor: para actualizar contador global
            new PrivateChannel('user.' . $this->receptorId),
        ];
    }

    public function broadcastAs()
    {
        return 'MensajeEnviado';
    }

    public function broadcastWith()
    {
        return [
            'mensaje' => [
                'id' => $this->mensaje->id,
                'contenido' => $this->mensaje->contenido,
                'emisor_id' => $this->mensaje->emisor_id,
                'chat_id' => $this->mensaje->chat_id,
                'created_at' => $this->mensaje->created_at,
            ],
            'receptor_id' => $this->receptorId,
        ];
    }
}
