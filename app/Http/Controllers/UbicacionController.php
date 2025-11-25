<?php

namespace App\Http\Controllers;

use App\Models\UbicacionGuardada;
use App\Models\PerfPersona;
use App\Models\PerfInstitucion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UbicacionController extends Controller
{
    // Backend
    // UbicacionesController.php
    public function toggle(Request $request)
    {
        $user = auth()->user();
        $persona = PerfPersona::where('user_id', $user->id)->firstOrFail();
        $institucionId = $request->institucion_id;

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

        return response()->json(['guardada' => $guardada]);
    }




    public function index()
    {
        $user = auth()->user();
        $persona = PerfPersona::where('user_id', $user->id)->first();

        if (!$persona) {
            abort(403, "Solo los usuarios tipo persona pueden ver ubicaciones guardadas.");
        }

        $ubicaciones = UbicacionGuardada::where('persona_id', $persona->id)
            ->with(['institucion.user'])
            ->paginate(10);

        return Inertia::render('Ubicaciones/Show', [
            'auth' => ['user' => $user],
            'ubicaciones' => $ubicaciones,
            'userType' => 'persona',
        ]);
    }
}
