<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class EnsureProfileIsComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $rutasPublicas = [
            'institucion.aprobar',
            'institucion.rechazar'
        ];

        if ($request->routeIs($rutasPublicas)) {
            return $next($request);
        }

        $user = $request->user();

        // si es un usuario autenticado
        if ($user) {

            // Estado: INACTIVO
            if ($user->estado === 'inactivo') {
                if (!$request->routeIs('logout')) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect()->route('login')->withErrors([
                        'error' => 'Tu cuenta está inactiva. Contactá al administrador para más información.'
                    ]);
                }
            }

            // Estado: PENDIENTE_VERIF (verificar email)
            if ($user->estado === 'pendiente_verif') {
                $rutasPermitidas = [
                    'verification.notice',
                    'verification.verify',
                    'verification.send',
                    'logout'
                ];

                if (!$request->routeIs(...$rutasPermitidas)) {
                    return redirect()->route('verification.notice')
                        ->with('warning', 'Primero debes verificar tu email.');
                }
            }

            // Estado: PENDIENTE_DATOS (email verificado, debe completar datos)
            if ($user->estado === 'pendiente_datos') {
                $rutasPermitidas = [
                    'completar.datos',
                    'completar.datos.store',
                    'logout'
                ];

                if (!$request->routeIs(...$rutasPermitidas)) {
                    return redirect()->route('completar.datos', ['type' => $user->tipo_usuario])
                        ->with('warning', 'Debes completar tu perfil para continuar.');
                }
            }

            // Estado: PENDIENTE_APROBACION (solo instituciones)
            if ($user->estado === 'pendiente_aprobacion') {
                $rutasPermitidas = [
                    'institucion.pendiente',
                    'profile.edit', // eliminar
                    'logout',
                    'verification.notice',
                    'verification.verify',
                    'verification.send'
                ];

                if (!$request->routeIs(...$rutasPermitidas)) {
                    return redirect()->route('institucion.pendiente')
                        ->with('warning', 'Tu institución está pendiente de verificación por el administrador.');
                }
            }

            // Estado: ACTIVO (acceso completo)
            if ($user->estado === 'activo') {
                $rutasRestringidas = [
                    'login',
                    'register',
                    'password.request',
                    'password.reset',
                    'completar.datos',
                    'completar.datos.store'
                ];

                if ($request->routeIs($rutasRestringidas) || $request->is('/')) {
                    return redirect()->route('inicio');
                }
            }
        }

        // Usuario NO autenticado
        else {
            // Solo permitir acceso a completar datos si hay sesión temporal válida
            if ($request->routeIs(['completar.datos', 'completar.datos.store'])) {
                $registroTemporal = session('registro_temporal');

                if (!$registroTemporal) {
                    return redirect()->route('register')->withErrors([
                        'error' => 'Sesión expirada. Registrate nuevamente.'
                    ]);
                }

                // Verificar timeout (15 minutos)
                $now = Carbon::now()->timestamp;
                $expiraEn = $registroTemporal['expires_at'] ?? 0;

                if ($now > $expiraEn) {
                    session()->forget('registro_temporal');
                    return redirect()->route('register')->withErrors([
                        'error' => 'Tu sesión expiró. Tenés 15 minutos para completar el registro.'
                    ]);
                }

                // Validar que el tipo en URL coincida con el de sesión
                if ($request->routeIs('completar.datos')) {
                    $typeEnUrl = $request->route('type');
                    $typeEnSesion = $registroTemporal['tipo_usuario'];

                    if ($typeEnUrl !== $typeEnSesion) {
                        return redirect()->route('completar.datos', ['type' => $typeEnSesion])
                            ->withErrors(['error' => 'No podés acceder a ese tipo de registro.']);
                    }
                }
            }
        }

        return $next($request);
    }
}