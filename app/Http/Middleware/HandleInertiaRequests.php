<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Mensaje;
use Illuminate\Support\Facades\Auth;
use App\Models\ComentPublicacion;
use Illuminate\Notifications\DatabaseNotification;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        // Si NO hay usuario autenticado, devolver valores vacíos
        if (!$user) {
            return array_merge(parent::share($request), [
                'auth' => [
                    'user' => null,
                ],
                'notificaciones' => [],
                'contadorNotificaciones' => 0,
            ]);
        }

        // 🔹 Contador de mensajes no leídos (chats)
        $unread = 0;
        if ($user) {
            $unread = Mensaje::where('leido', false)
                ->where('emisor_id', '!=', $user->id)
                ->whereHas('chat', function ($q) use ($user) {
                    $q->where(function($sub) use ($user) {
                        $sub->where('persona_id', optional($user->persona)->id)
                            ->orWhere('institucion_id', optional($user->institucion)->id);
                    });
                })
                ->count();
        }

        // 🔹 Notificaciones de comentarios
        $notificacionesIniciales = DatabaseNotification::where('notifiable_id', $user->id)
            ->where('type', 'App\Notifications\ComentarioCreadoNotification')
            ->latest()
            ->take(20)
            ->get(); // Últimas 20 notificaciones de comentarios (para mostrar en el dropdown)

        // 🔹 Notificaciones no leídas (para mostrar el contador rojo)
        $notificacionesNoLeidas = DatabaseNotification::where('notifiable_id', $user->id)
            ->where('type', 'App\Notifications\ComentarioCreadoNotification')
            ->whereNull('read_at')
            ->get(); // Notificaciones no leídas

            \Log::info('Share props notificacionesIniciales', [
            'user_id' => $user->id,
            'notificaciones' => $notificacionesIniciales->toArray(),
        ]);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'csrf_token' => csrf_token(),
            'unreadCount' => $unread, // mensajes no leídos (chats)
            'notificacionesIniciales' => $notificacionesIniciales, // últimas 20 notificaciones
            'notificacionesNoLeidasCount' => $notificacionesNoLeidas->count(), // contador del punto rojo
        ];
    }

    /**
     * Handle the incoming request.
     */
    public function handle($request, $next)
    {
        $response = parent::handle($request, $next);

        // Si hay un error 419, retornar una respuesta que Inertia pueda manejar
        if ($response->status() === 419) {
            return back()->with('error', 'Tu sesión ha expirado. Por favor, intenta nuevamente.');
        }

        return $response;
    }
}

    // public function share(Request $request): array
    // {
    //     return [
    //         ...parent::share($request),
    //         'auth' => [
    //             'user' => $request->user(),
    //         ],
    //     ];
    // }

