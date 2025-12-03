<?php

namespace App\Http\Controllers;

use App\Models\InstitucionMaterial;
use App\Models\PerfInstitucion;
use App\Models\PerfPersona;
use App\Models\UbicacionGuardada;
use App\Models\Publicacion;
use App\Models\VisitaInstitucion;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InstitucionController extends Controller
{
    /**
     * Muestra el perfil público de una institución junto con sus publicaciones.
     */
    public function show($id)
{
    $user = Auth::user();
    $guardada = false;

    // Obtener institución con sus relaciones principales
    $institucion = PerfInstitucion::with([
        'user',
        'residencias',
        'publicaciones' => function ($query) {
            $query->publicadas()
                ->recientes()
                ->with(['media', 'likes', 'comentarios']);
        }
    ])->findOrFail($id);

    // Registrar visita si el usuario es persona
    if ($user && $user->tipo_usuario === 'persona') {
        VisitaInstitucion::registrarVisita($user->id, $institucion->id);
    }

    // Verificar si la institución está guardada
    if ($user) {
            if ($user->tipo_usuario === 'persona') {
                $persona = PerfPersona::where('user_id', $user->id)->first();
                
                if ($persona) {
                    $guardada = UbicacionGuardada::where('persona_id', $persona->id)
                        ->where('institucion_id', $institucion->id)
                        ->exists();
                }
            } elseif ($user->tipo_usuario === 'institucion') {
                $institucionGuardador = PerfInstitucion::where('user_id', $user->id)->first();
                
                if ($institucionGuardador) {
                    $guardada = UbicacionGuardada::where('guardador_institucion_id', $institucionGuardador->id)
                        ->where('institucion_id', $institucion->id)
                        ->exists();
                }
            }
        }

    // Paginar publicaciones
    $publicaciones = Publicacion::where('perf_institucion_id', $id)
        ->where('publicado', true)
        ->with([
            'institucion.user',
            'media',
            'likes',
            'comentarios',
            'favoritos'
        ])
        ->withCount(['likes', 'comentarios'])
        ->latest()
        ->paginate(10, ['*'], 'pub_page')
        ->withQueryString();

    // Agregar info de si el usuario dio like/fav
    if ($user) {
        $publicaciones->getCollection()->transform(function ($publicacion) use ($user) {
            if ($user->tipo_usuario === 'persona') {
                $publicacion->user_has_liked =
                    $publicacion->likes->contains('perf_persona_id', $user->persona->id);

                $publicacion->is_favorite =
                    $publicacion->favoritos->contains('perf_persona_id', $user->persona->id);

            } else {
                $publicacion->user_has_liked =
                    $publicacion->likes->contains('perf_institucion_id', $user->institucion->id);

                $publicacion->is_favorite = false;
            }

            return $publicacion;
        });
    }

    // Paginar residencias
    $residencias = $institucion->residencias()
        ->paginate(9, ['*'], 'res_page')
        ->withQueryString();

    // Paginar cursos y materiales
    $materiales = InstitucionMaterial::where('perf_institucion_id', $id)
        ->where('publicado', true)
        ->latest()
        ->paginate(12);

    return Inertia::render('Instituciones/Show', [
        'institucion' => $institucion,
        'guardada' => $guardada,
        'publicaciones' => $publicaciones,
        'residencias' => $residencias,
        'materiales' => $materiales,
        'auth' => [
            'user' => auth()->user(),
        ],
    ]);
}

}