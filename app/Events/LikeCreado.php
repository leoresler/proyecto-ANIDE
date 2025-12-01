<?php

namespace App\Events;

use App\Models\Like;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

use App\Notifications\LikeCreadoNotification;

class LikeCreado implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $like;
    public $receptorId;

    public function __construct(Like $like)
    {
        $this->like = $like;

        // 👇 CAMBIAR TODO ESTO
        // Determinar el receptor según el tipo de target
        if ($like->target_tipo === 'publicacion') {
            $publicacion = $like->publicacion;
            $this->receptorId = $publicacion->institucion->user->id;
            
            $usuarioQueHizoLike = $like->persona->user ?? $like->institucion->user;
            
            if ($usuarioQueHizoLike && $usuarioQueHizoLike->id !== $this->receptorId) {
                $publicacion->institucion->user->notify(new LikeCreadoNotification($like));
            }
            
        } elseif ($like->target_tipo === 'comentario') {
            $comentario = $like->comentario;
            $receptor = $comentario->persona?->user ?? $comentario->institucion?->user;
            
            if (!$receptor) {
                return; // Si no hay receptor, no hacer nada
            }
            
            $this->receptorId = $receptor->id;
            
            $usuarioQueHizoLike = $like->persona->user ?? $like->institucion->user;
            
            if ($usuarioQueHizoLike && $usuarioQueHizoLike->id !== $this->receptorId) {
                $receptor->notify(new LikeCreadoNotification($like));
            }
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
        return 'LikeCreado';
    }

    public function broadcastWith()
    {
        $this->like->load(['persona.user', 'institucion.user']);

        $usuario = $this->like->persona->user ?? $this->like->institucion->user;

        $usuario_nombre = $usuario->name ?? $usuario->nombre ?? 'Usuario desconocido';
        $usuario_foto = $usuario && $usuario->profile_photo_path
            ? asset('storage/' . $usuario->profile_photo_path)
            : asset('/storage/profile-photos/default-avatar.webp');

        return [
            'type' => 'App\Notifications\LikeCreadoNotification',
            'like' => [
                'id' => $this->like->id,
                'publicacion_id' => $this->like->target_id,
                'target_tipo' => $this->like->target_tipo, // 👈 AGREGAR ESTO
                'usuario' => [
                    'id'   => $usuario->id ?? null,
                    'name' => $usuario_nombre,
                    'foto' => $usuario_foto,
                ],
                'created_at' => $this->like->created_at,
            ],
        ];
    }


}
