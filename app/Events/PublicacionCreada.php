<?php

// namespace App\Events;

// use App\Models\Publicacion;
// use Illuminate\Broadcasting\Channel;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Broadcasting\PrivateChannel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Queue\SerializesModels;

// class PublicacionCreada implements ShouldBroadcast
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public $publicacion;
//     public $institucion;

//     public function __construct(Publicacion $publicacion)
//     {
//         $this->publicacion = $publicacion;
//         $this->institucion = $publicacion->institucion;
//     }

//     public function broadcastOn()
//     {
//         // Enviamos la notificación a todos los usuarios que guardaron esta institución
//         return $this->institucion->guardadaPorUsuarios()->pluck('user_id')->map(
//             fn($userId) => new PrivateChannel('usuario.' . $userId)
//         )->all();
//     }

//     public function broadcastWith()
//     {
//         return [
//             'mensaje' => "La institución {$this->institucion->nombre} publicó: {$this->publicacion->titulo}",
//             'institucion_id' => $this->institucion->id,
//             'publicacion_id' => $this->publicacion->id,
//         ];
//     }
// }
