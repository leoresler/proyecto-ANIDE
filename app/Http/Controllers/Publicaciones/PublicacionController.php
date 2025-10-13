<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\PublicacionMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PublicacionController extends Controller
{
    /**
     * Muestra el feed principal con todas las publicaciones
     */
    public function index()
    {
        $user = Auth::user();

        // verifica si el usuario tiene su perfil cargado
        if ($user->tipo_usuario === 'persona' && !$user->persona) {
            abort(500, 'Perfil de persona no encontrado');
        }
        if ($user->tipo_usuario === 'institucion' && !$user->institucion) {
            abort(500, 'Perfil de institución no encontrado');
        }

        $publicaciones = Publicacion::with([
            'institucion.user',
            'media',
            'likes',
            'comentarios',
            'favoritos' => function ($query) use ($user) {
                if ($user->tipo_usuario === 'persona') {
                    $query->where('perf_persona_id', $user->persona->id);
                }
            }
        ])
            ->where('publicado', true)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Agregar informacion adicional a cada publicacion
        $publicaciones->getCollection()->transform(function ($publicacion) use ($user) {
            $publicacion->likes_count = $publicacion->likes->count();
            $publicacion->comentarios_count = $publicacion->comentarios->count();

            // Verificar si el usuario actual dio like
            if ($user->tipo_usuario === 'persona') {
                $publicacion->user_has_liked = $publicacion->likes->contains(function ($like) use ($user) {
                    return $like->perf_persona_id === $user->persona->id;
                });
            } else {
                $publicacion->user_has_liked = $publicacion->likes->contains(function ($like) use ($user) {
                    return $like->perf_institucion_id === $user->institucion->id;
                });
            }

            // Verificar si está en favoritos (solo personas)
            if ($user->tipo_usuario === 'persona') {
                $publicacion->is_favorite = $publicacion->favoritos->isNotEmpty();
            } else {
                $publicacion->is_favorite = false;
            }



            return $publicacion;
        });

        return Inertia::render('Inicio', [
            'publicaciones' => $publicaciones,
            'userType' => $user->tipo_usuario,
        ]);
    }

    /**
     * Muestra una publicación especifica
     */
    public function show($id)
    {
        $user = Auth::user();

        // verifica si el usuario tiene su perfil cargado
        if ($user->tipo_usuario === 'persona' && !$user->persona) {
            abort(500, 'Perfil de persona no encontrado');
        }
        if ($user->tipo_usuario === 'institucion' && !$user->institucion) {
            abort(500, 'Perfil de institución no encontrado');
        }

        $publicacion = Publicacion::with([
            'institucion.user',
            'media',
            'likes',
            'comentarios' => function ($query) {
                $query->whereNull('coment_padre_id')
                    ->with([
                        'persona.user',
                        'institucion.user',
                        'respuestas' => function ($subQuery) {
                            $subQuery->with(['persona.user', 'institucion.user', 'likes'])
                                ->orderBy('created_at', 'asc');
                        },
                        'likes'
                    ])
                    ->orderBy('created_at', 'desc');
            },
            'favoritos' => function ($query) use ($user) {
                if ($user->tipo_usuario === 'persona') {
                    $query->where('perf_persona_id', $user->persona->id);
                }
            }
        ])->findOrFail($id);

        // Incrementar contador de visualizaciones
        $publicacion->increment('count_visualizaciones');

        // Información adicional
        $publicacion->likes_count = $publicacion->likes->count();

        // Verificar si el usuario actual dio like
        if ($user->tipo_usuario === 'persona') {
            $publicacion->user_has_liked = $publicacion->likes->contains(function ($like) use ($user) {
                return $like->perf_persona_id === $user->persona->id;
            });
        } else {
            $publicacion->user_has_liked = $publicacion->likes->contains(function ($like) use ($user) {
                return $like->perf_institucion_id === $user->institucion->id;
            });
        }

        if ($user->tipo_usuario === 'persona') {
            $publicacion->is_favorite = $publicacion->favoritos->isNotEmpty();
        } else {
            $publicacion->is_favorite = false;
        }

        return Inertia::render('Publicaciones/Show', [
            'publicacion' => $publicacion,
            'userType' => $user->tipo_usuario,
        ]);
    }

    /**
     * Muestra las publicaciones de la institución actual
     * Solo accesible por instituciones
     */
    public function misPublicaciones()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'No tienes permiso para acceder a esta página');
        }

        $publicaciones = Publicacion::with(['media', 'likes', 'comentarios'])
            ->where('perf_institucion_id', $user->institucion->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $publicaciones->getCollection()->transform(function ($publicacion) {
            $publicacion->likes_count = $publicacion->likes->count();
            $publicacion->comentarios_count = $publicacion->comentarios->count();
            return $publicacion;
        });

        return Inertia::render('Publicaciones/MisPublicaciones', [
            'publicaciones' => $publicaciones,
        ]);
    }

    /**
     * Muestra el formulario para crear una nueva publicación
     */
    public function create()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden crear publicaciones');
        }

        return Inertia::render('Publicaciones/Create');
    }

    /**
     * Almacena una nueva publicación
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden crear publicaciones');
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'contenido' => 'required|string',
            'publicado' => 'boolean',
            'media' => 'nullable|array',
            'media.*.file' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov,pdf,doc,docx|max:20480',
            'media.*.tipo' => 'required|in:imagen,video,documento',
        ]);

        $publicacion = Publicacion::create([
            'perf_institucion_id' => $user->institucion->id,
            'titulo' => $validated['titulo'],
            'contenido' => $validated['contenido'],
            'publicado' => $validated['publicado'] ?? true,
        ]);

        // Procesar archivos media
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $mediaItem) {
                $path = $mediaItem['file']->store('publicaciones', 'public');

                PublicacionMedia::create([
                    'publicacion_id' => $publicacion->id,
                    'tipo' => $mediaItem['tipo'],
                    'url' => $path,
                    'orden' => $index,
                ]);
            }
        }

        return redirect()->route('publicaciones.misPublicaciones')
            ->with('success', 'Publicación creada exitosamente');
    }

    /**
     * Elimina una publicación (soft delete)
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $publicacion = Publicacion::findOrFail($id);

        // Verificar que la publicación pertenece a la institución del usuario
        if ($publicacion->perf_institucion_id !== $user->institucion->id) {
            abort(403, 'No tienes permiso para eliminar esta publicación');
        }

        $publicacion->delete();

        return redirect()->back()
            ->with('success', 'Publicación eliminada exitosamente');
    }
}
