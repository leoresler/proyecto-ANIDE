<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PerfInstitucion;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\InstitucionAprobada;
use App\Mail\InstitucionRechazada;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class InstitucionAprobacionController extends Controller
{
    /**
     * Aprobar institución via token
     */
    public function aprobar($token)
    {

        // Buscar institución por token
        $institucion = PerfInstitucion::where('approval_token', $token)
            ->whereNotNull('approval_token')
            ->first();

        if (!$institucion) {
            return view('aprobacion-error', [
                'mensaje' => 'Token inválido o ya utilizado.'
            ]);
        }

        $user = $institucion->user;

        if (!$user) {
            return view('aprobacion-error', [
                'mensaje' => 'Usuario no encontrado.'
            ]);
        }

        DB::beginTransaction();
        
        try {
            // Actualizar institución
            $institucion->verificado = 1;
            $institucion->approval_token = null;
            $institucion->save();

            Log::info('Institución actualizada. Verificado: ' . $institucion->verificado);

            // Actualizar usuario
            $user->estado = 'activo';
            $user->save();

            Log::info('Usuario actualizado. Estado: ' . $user->estado);

            DB::commit();

            // Enviar email de aprobación
            try {
                Mail::to($user->email)->send(new InstitucionAprobada($user));
                Log::info('Email de aprobación enviado a: ' . $user->email);
            } catch (\Exception $e) {
                Log::error('Error enviando email de aprobación: ' . $e->getMessage());
            }

            return view('aprobacion-exitosa', [
                'user' => $user,
                'mensaje' => 'La institución fue aprobada correctamente.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al aprobar institución: ' . $e->getMessage());
            
            return view('aprobacion-error', [
                'mensaje' => 'Hubo un error al aprobar la institución.'
            ]);
        }
    }

    /**
     * Rechazar institución via token
     */
    public function rechazar($token)
    {
        Log::info('Intentando rechazar con token: ' . $token);

        $institucion = PerfInstitucion::where('approval_token', $token)
            ->whereNotNull('approval_token')
            ->first();

        if (!$institucion) {
            Log::error('Token no encontrado o ya utilizado: ' . $token);
            return view('aprobacion-error', [
                'mensaje' => 'Token inválido o ya utilizado.'
            ]);
        }

        $user = $institucion->user;

        if (!$user) {
            return view('aprobacion-error', [
                'mensaje' => 'Usuario no encontrado.'
            ]);
        }

        DB::beginTransaction();
        
        try {
            // Marcar como rechazada (verificado = 0 o eliminar)
            $institucion->verificado = 0;
            $institucion->approval_token = null;
            $institucion->save();

            // Usuario inactivo
            $user->estado = 'inactivo';
            $user->save();

            DB::commit();

            // Enviar email de rechazo
            try {
                Mail::to($user->email)->send(
                    new InstitucionRechazada($user, 'Tu institución no cumple con los requisitos necesarios.')
                );
                Log::info('Email de rechazo enviado a: ' . $user->email);
            } catch (\Exception $e) {
                Log::error('Error enviando email de rechazo: ' . $e->getMessage());
            }

            return view('rechazo-exitoso', [
                'user' => $user,
                'mensaje' => 'La institución fue rechazada correctamente.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al rechazar institución: ' . $e->getMessage());
            
            return view('aprobacion-error', [
                'mensaje' => 'Hubo un error al rechazar la institución.'
            ]);
        }
    }
}