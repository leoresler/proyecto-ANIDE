<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPersona
{
    /**
     * Verifica que el usuario autenticado sea una persona
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || auth()->user()->tipo_usuario !== 'persona') {
            abort(403, 'Solo las personas tienen acceso a esta funcionalidad');
        }

        return $next($request);
    }
}