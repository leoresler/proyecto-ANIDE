<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Si ya verificó el email
        if ($user->hasVerifiedEmail()) {
            // Redirigir según el estado actual
            if ($user->estado === 'pendiente_datos') {
                return redirect()->route('completar.datos', ['type' => $user->tipo_usuario]);
            }

            if ($user->estado === 'pendiente_aprobacion') {
                return redirect()->route('institucion.pendiente');
            }

            return redirect()->route('inicio')->with('verified', true);
        }

        // Marcar email como verificado
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));

            // Cambiar estado a 'pendiente_datos'
            $user->update(['estado' => 'pendiente_datos']);
        }

        // Redirigir a completar datos
        return redirect()->route('completar.datos', ['type' => $user->tipo_usuario])
            ->with('success', '¡Email verificado! Ahora completá tus datos.');
    }
}
