<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\Mensaje;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Inertia::share([
            'unreadCount' => function () {
                if (!auth()->check()) {
                    return 0;
                }

                return Mensaje::where('leido', false)
                    ->where('emisor_id', '!=', auth()->id())
                    ->whereHas('chat', function ($q) {
                        $q->where(function ($q2) {
                            $q2->where('persona_id', auth()->user()->idPersona ?? null)
                            ->orWhere('institucion_id', auth()->user()->idInstitucion ?? null);
                        });
                    })
                    ->count();
            },
        ]);
    }
}
