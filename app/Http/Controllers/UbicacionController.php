<?php

namespace App\Http\Controllers;

use App\Models\UbicacionGuardada;
use App\Models\PerfPersona;
use App\Models\PerfInstitucion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UbicacionController extends Controller
{
    public function toggle(Request $request)
    {
        $user = auth()->user();
        $institucionId = $request->institucion_id;

        // 👇 CAMBIAR TODA ESTA LÓGICA
        if ($user->tipo_usuario === 'persona') {
            $persona = PerfPersona::where('user_id', $user->id)->firstOrFail();

            $ubicacion = UbicacionGuardada::where('persona_id', $persona->id)
                ->where('institucion_id', $institucionId)
                ->first();

            if ($ubicacion) {
                $ubicacion->delete();
                $guardada = false;
            } else {
                UbicacionGuardada::create([
                    'persona_id' => $persona->id,
                    'institucion_id' => $institucionId,
                ]);
                $guardada = true;
            }
        } else { // tipo_usuario === 'institucion'
            $institucion = PerfInstitucion::where('user_id', $user->id)->firstOrFail();

            $ubicacion = UbicacionGuardada::where('guardador_institucion_id', $institucion->id)
                ->where('institucion_id', $institucionId)
                ->first();

            if ($ubicacion) {
                $ubicacion->delete();
                $guardada = false;
            } else {
                UbicacionGuardada::create([
                    'guardador_institucion_id' => $institucion->id,
                    'institucion_id' => $institucionId,
                ]);
                $guardada = true;
            }
        }

        return response()->json(['guardada' => $guardada]);
    }

    public function index()
    {
        $user = auth()->user();

        // 👇 CAMBIAR ESTA LÓGICA
        if ($user->tipo_usuario === 'persona') {
            $persona = PerfPersona::where('user_id', $user->id)->first();

            if (!$persona) {
                abort(403, "No se encontró el perfil de persona.");
            }

            $ubicaciones = UbicacionGuardada::where('persona_id', $persona->id)
                ->with(['institucion.user'])
                ->paginate(10);

        } else { // tipo_usuario === 'institucion'
            $institucion = PerfInstitucion::where('user_id', $user->id)->first();

            if (!$institucion) {
                abort(403, "No se encontró el perfil de institución.");
            }

            $ubicaciones = UbicacionGuardada::where('guardador_institucion_id', $institucion->id)
                ->with(['institucion.user'])
                ->paginate(10);
        }

        return Inertia::render('Ubicaciones/Show', [
            'auth' => ['user' => $user],
            'ubicaciones' => $ubicaciones,
            'userType' => $user->tipo_usuario,
        ]);
    }
}