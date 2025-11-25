<?php

namespace App\Notifications;

use App\Models\Publicacion;
use App\Models\UbicacionGuardada;
use Illuminate\Notifications\Notification;

class InstitucionPublicaNotification extends Notification
{
    public $publicacion;

    public function __construct(Publicacion $publicacion)
    {
        $this->publicacion = $publicacion;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'InstitucionPublicaNotification',
            'institucion_id' => $this->publicacion->perf_institucion_id,
            'institucion_nombre' => $this->publicacion->institucion->nombre,
            'publicacion_id' => $this->publicacion->id,
            'titulo' => $this->publicacion->titulo,
            'created_at' => now(),
        ];
    }

    // Opcional: si más adelante querés broadcast, lo hacemos después
}
