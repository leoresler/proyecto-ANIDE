<?php

namespace App\Events;

use App\Models\Publicacion;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PublicacionCreada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $publicacion;
    public $institucion;

    public function __construct(Publicacion $publicacion)
    {
        $this->publicacion = $publicacion;
        $this->institucion = $publicacion->institucion;
    }

    public function broadcastAs()
    {
        return 'UbicacionGuardada';
    }


    public function broadcastOn()
    {
        // Enviamos la notificación a todos los usuarios que guardaron esta institución
        $userIds = $this->institucion->guardadaPorUsuarios()->pluck('user_id');
        if ($userIds->isEmpty()) {
            return new PrivateChannel('vacio'); // canal dummy, no se usará
        }
        return $userIds->map(fn($id) => new PrivateChannel('user.' . $id))->all();
    }

    public function broadcastWith()
    {
        return [
            'mensaje' => " ha publicado: {$this->publicacion->titulo}",
            'institucion_id' => $this->institucion->id,
            'publicacion_id' => $this->publicacion->id,
            'usuario' => [
                'id' => $this->institucion->user->id,
                'nombre' => $this->institucion->nombre,
                'foto' => $this->institucion->foto_perfil
                    ? asset('storage/' . $this->institucion->foto_perfil)
                    : '/storage/profile-photos/default-avatar.webp',
            ],
            'created_at' => now()->toDateTimeString(),
        ];
    }

}
