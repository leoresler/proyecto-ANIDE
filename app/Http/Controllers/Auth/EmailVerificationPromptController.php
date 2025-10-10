<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        // Si ya verificó el email
        if ($request->user()->hasVerifiedEmail()) {
            
            // Si está en pendiente_datos, redirigir a completar datos
            if ($request->user()->estado === 'pendiente_datos') {
                return redirect()->route('completar.datos', ['type' => $request->user()->tipo_usuario]);
            }
            
            // Si está en pendiente_aprobacion (institución), redirigir a vista de espera
            if ($request->user()->estado === 'pendiente_aprobacion') {
                return redirect()->route('institucion.pendiente');
            }
            
            // Si está activo, ir al inicio
            if ($request->user()->estado === 'activo') {
                return redirect()->intended(route('inicio', absolute: false));
            }
        }
        
        // Mostrar la vista de verificación
        return Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
}