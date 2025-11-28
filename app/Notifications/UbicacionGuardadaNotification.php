<?php

namespace App\Notifications;

use App\Models\Publicacion;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class UbicacionGuardadaNotification extends Notification
{
    use Queueable;

    public $publicacion;

    public function __construct(Publicacion $publicacion)
    {
        $this->publicacion = $publicacion;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    // Lo que guardamos en la BD (usado por notificacionesIniciales)
    public function toDatabase($notifiable)
    {
        return [
            'tipo' => 'publicacion',
            'mensaje' => " ha publicado: {$this->publicacion->titulo}",
            'institucion_id' => $this->publicacion->institucion->id,
            'publicacion_id' => $this->publicacion->id,
            'usuario' => [
                'id' => $this->publicacion->institucion->user->id ?? null,
                'nombre' => $this->publicacion->institucion->nombre ?? 'Institución',
                // usar el mismo nombre de archivo por defecto que espera el frontend
                'foto' => $this->publicacion->institucion->foto_perfil
                    ? asset('storage/' . $this->publicacion->institucion->foto_perfil)
                    : '/storage/profile-photos/default-avatar.webp',
            ],
            'created_at' => now()->toDateTimeString(),
        ];
    }

    // Lo que llega por broadcast (tiempo real)
    public function toBroadcast($notifiable)
    {
        $data = $this->toDatabase($notifiable); // Reutilizamos el mismo formato

        // Log para debugging (puedes eliminar luego)
        \Log::info('Broadcasting UbicacionGuardadaNotification', $data);

        return new BroadcastMessage($data);
    }

    // Opcional: toArray para consistencia si se usa en algún lugar
    public function toArray($notifiable)
    {
        return $this->toDatabase($notifiable);
    }

    // Nombre del evento en frontend (si escuchas .UbicacionGuardada)
    public function broadcastType()
    {
        return 'UbicacionGuardada';
    }
}
