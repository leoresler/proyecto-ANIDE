<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInstitucion
{
    /**
     * Verifica que el usuario autenticado sea una institución
     */
    public function handle(Request $request, Closure $next): Response
    {
        
        if (!auth()->check() || auth()->user()->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones tienen acceso a esta funcionalidad');
        }

        return $next($request);
    }
}