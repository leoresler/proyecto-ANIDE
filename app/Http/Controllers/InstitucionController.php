<?php

namespace App\Http\Controllers;

use App\Models\PerfInstitucion;
use App\Models\Publicacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InstitucionController extends Controller
{
    /**
     * Muestra el perfil público de una institución junto con sus publicaciones.
     */
    public function show($id)
    {
        $institucion = PerfInstitucion::with([
            'user',
            'residencias',
            'publicaciones' => function ($query) {
                $query->publicadas()
                    ->recientes()
                    ->with(['media', 'likes', 'comentarios']);
            }
        ])->findOrFail($id);

        return Inertia::render('Instituciones/Show', [
            'institucion' => $institucion,
            'publicaciones' => $institucion->publicaciones, // 👈 ya viene con todo
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

}
