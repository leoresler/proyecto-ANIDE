<?php

namespace App\Http\Controllers;

use App\Models\InstitucionMaterial;
use App\Models\PerfInstitucion;
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
        $institucion = PerfInstitucion::with(['user'])
            ->findOrFail($id);

        if ($user->tipo_usuario === 'persona') {
            VisitaInstitucion::registrarVisita($user->id, $institucion->id);
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


        // Agregar info de si el usuario dio like/favorito
        if ($user) {
            $publicaciones->getCollection()->transform(function ($publicacion) use ($user) {
                if ($user->tipo_usuario === 'persona') {
                    $publicacion->user_has_liked = $publicacion->likes->contains('perf_persona_id', $user->persona->id);
                    $publicacion->is_favorite = $publicacion->favoritos->contains('perf_persona_id', $user->persona->id);
                } else {
                    $publicacion->user_has_liked = $publicacion->likes->contains('perf_institucion_id', $user->institucion->id);
                    $publicacion->is_favorite = false;
                }
                return $publicacion;
            });
        }

        // aginar residencias
        $residencias = $institucion->residencias()
            ->paginate(9, ['*'], 'res_page')
            ->withQueryString();

        
        $materiales = InstitucionMaterial::where('perf_institucion_id', $id)
        ->where('publicado', true)
        ->latest()
        ->paginate(12);
        
        
        return Inertia::render('Instituciones/Show', [
            'institucion' => $institucion,
            'publicaciones' => $publicaciones,
            'residencias' => $residencias,
            'materiales' => $materiales,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }
}
