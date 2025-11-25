<?php

namespace App\Http\Controllers;

use App\Models\PerfInstitucion;
use App\Models\PerfPersona;
use App\Models\UbicacionGuardada;
use Inertia\Inertia;

class InstitucionController extends Controller
{
    /**
     * Muestra el perfil público de una institución junto con sus publicaciones.
     */
    public function show($id)
    {
        $guardada = false;

        $institucion = PerfInstitucion::with([
            'user',
            'residencias',
            'publicaciones' => function ($query) {
                $query->publicadas()
                    ->recientes()
                    ->with(['media', 'likes', 'comentarios']);
            }
        ])->findOrFail($id);

        $guardada = false;
        if (auth()->check()) {
            $persona = PerfPersona::where('user_id', auth()->id())->first();
            $guardada = UbicacionGuardada::where('persona_id', $persona->id)
                ->where('institucion_id', $institucion->id)
                ->exists();
        }


        return Inertia::render('Instituciones/Show', [
            'institucion' => $institucion,
            'guardada' => $guardada,
            'publicaciones' => $institucion->publicaciones,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

}
