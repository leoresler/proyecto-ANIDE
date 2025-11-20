<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // Compartir el token CSRF en todas las páginas
            'csrf_token' => csrf_token(),
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