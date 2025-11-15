<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Mensaje;
use Illuminate\Support\Facades\Auth;

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

        $unread = 0;
        if ($user) {
            // contar mensajes no leídos dirigidos al user
            $unread = Mensaje::where('leido', false)
                ->where('emisor_id', '!=', $user->id)
                ->whereHas('chat', function ($q) use ($user) {
                    // nos aseguramos que el chat contenga al user: (persona_id/institucion_id relacionados)
                    // si tu estructura guarda persona_id/institucion_id, probá esto simple:
                    $q->where(function($sub) use ($user) {
                        // si el usuario tiene perf_persona o perf_institucion
                        $sub->where('persona_id', optional($user->persona)->id)
                            ->orWhere('institucion_id', optional($user->institucion)->id);
                    });
                })
                ->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'unreadCount' => $unread,
        ];
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
}
