<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // if ($user->estado === 'pendiente_verif') {
            //     // permitir acceso solo a completar datos y logout
            //     if (!$request->routeIs('completar.datos') && 
            //         !$request->routeIs('completar.datos.store') && 
            //         !$request->routeIs('logout')) {
            //         return redirect()->route('completar.datos', ['type' => $user->tipo_usuario]);
            //     }
            // }

            // si el usuario esta inactivo, se desloguea
            if ($user->estado === 'inactivo' && !$request->routeIs('logout')) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect()->route('login')->withErrors([
                    'error' => 'Tu cuenta está inactiva. Contacta al administrador.'
                ]);
            }
            
            // si esta activo no se permite ingresar a completar datos
            if ($user->estado === 'activo' && $request->routeIs('completar.datos')) {
                return redirect()->route('inicio');
            }
        }

        return $next($request);
    }
}