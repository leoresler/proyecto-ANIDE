<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar rutas para canales privados y presencia
        Broadcast::routes(['middleware' => ['auth']]);

        // Cargar definiciones de canales
        require base_path('routes/channels.php');
    }
}
