<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\PublicacionMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PublicacionController extends Controller
{
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
            'publicado' => 'nullable',
        ]);

        // Crear la publicación
        $publicacion = Publicacion::create([
            'perf_institucion_id' => $user->institucion->id,
            'titulo' => $validated['titulo'],
            'contenido' => $validated['contenido'],
            'publicado' => $request->input('publicado') == '1' || $request->input('publicado') == 1 || $request->input('publicado') === true,
        ]);


        // Procesar archivos multimedia
        $mediaCount = 0;

        $index = 0;
        while ($request->hasFile("media.{$index}.file")) {
            try {
                $file = $request->file("media.{$index}.file");
                $tipo = $request->input("media.{$index}.tipo");

                Log::info("Procesando media.{$index}.file", [
                    'original_name' => $file->getClientOriginalName(),
                    'tipo' => $tipo,
                    'size' => $file->getSize(),
                ]);

                // Guardar el archivo
                $path = $file->store('publicaciones', 'public');


                // Crear el registro en la base de datos
                $media = PublicacionMedia::create([
                    'publicacion_id' => $publicacion->id,
                    'tipo' => $tipo,
                    'url' => $path,
                    'orden' => $index,
                ]);

                $mediaCount++;
            } catch (\Exception $e) {
                Log::error("Error procesando media.{$index}.file: " . $e->getMessage());
                Log::error($e->getTraceAsString());
            }

            $index++;
        }

        return redirect()->route('publicaciones.misPublicaciones')
            ->with('success', 'Publicación creada exitosamente');
    }

    /**
     * Muestra el feed principal con todas las publicaciones
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->tipo_usuario === 'persona' && !$user->persona) {
            abort(500, 'Perfil de persona no encontrado');
        }
        if ($user->tipo_usuario === 'institucion' && !$user->institucion) {
            abort(500, 'Perfil de institución no encontrado');
        }

        $publicaciones = Publicacion::with([
            'institucion.user',
            'media' => function ($query) {
                $query->orderBy('orden', 'asc');
            },
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

        $publicaciones->getCollection()->transform(function ($publicacion) use ($user) {
            $publicacion->likes_count = $publicacion->likes->count();
            $publicacion->comentarios_count = $publicacion->comentarios->count();

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


            return $publicacion;
        });

        return Inertia::render('Inicio', [
            'publicaciones' => $publicaciones,
            'userType' => $user->tipo_usuario,
        ]);
    }

    /**
     * Muestra una publicación específica
     */
    public function show($id)
    {
        $user = Auth::user();

        if ($user->tipo_usuario === 'persona' && !$user->persona) {
            abort(500, 'Perfil de persona no encontrado');
        }
        if ($user->tipo_usuario === 'institucion' && !$user->institucion) {
            abort(500, 'Perfil de institución no encontrado');
        }

        $publicacion = Publicacion::with([
            'institucion.user',
            'media' => function ($query) {
                $query->orderBy('orden', 'asc');
            },
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

        $publicacion->increment('count_visualizaciones');
        $publicacion->likes_count = $publicacion->likes->count();

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

        // DEBUG
        Log::info("Show publicacion {$id} con " . $publicacion->media->count() . " archivos media");

        return Inertia::render('Publicaciones/Show', [
            'publicacion' => $publicacion,
            'userType' => $user->tipo_usuario,
        ]);
    }

    /**
     * Muestra las publicaciones de la institución actual
     */
    public function misPublicaciones()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'No tienes permiso para acceder a esta página');
        }

        $publicaciones = Publicacion::with([
            'media' => function ($query) {
                $query->orderBy('orden', 'asc');
            },
            'likes',
            'comentarios'
        ])
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
     * Muestra el formulario de edición
     */
    public function edit($id)
    {
        $user = Auth::user();
        $publicacion = Publicacion::with('media')->findOrFail($id);

        if ($publicacion->perf_institucion_id !== $user->institucion->id) {
            abort(403, 'No tienes permiso para editar esta publicación');
        }

        return Inertia::render('Publicaciones/Edit', [
            'publicacion' => $publicacion,
        ]);
    }

    /**
     * Actualiza una publicación existente
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $publicacion = Publicacion::findOrFail($id);

        if ($publicacion->perf_institucion_id !== $user->institucion->id) {
            abort(403, 'No tienes permiso para editar esta publicación');
        }

        if ($publicacion->publicado) {
            $validated = $request->validate([
                'contenido' => 'required|string',
            ]);

            $publicacion->update([
                'contenido' => $validated['contenido'],
            ]);
        } else {
            $validated = $request->validate([
                'titulo' => 'required|string|max:255',
                'contenido' => 'required|string',
                'publicado' => 'nullable',
            ]);

            $publicacion->update([
                'titulo' => $validated['titulo'],
                'contenido' => $validated['contenido'],
                'publicado' => $request->input('publicado') == '1' || $request->input('publicado') == 1,
            ]);

            if ($request->has('deleted_media')) {
                $deletedMedia = $request->input('deleted_media');
                if (is_array($deletedMedia)) {
                    foreach ($deletedMedia as $mediaId) {
                        $media = PublicacionMedia::find($mediaId);
                        if ($media && $media->publicacion_id === $publicacion->id) {
                            Storage::disk('public')->delete($media->url);
                            $media->delete();
                        }
                    }
                }
            }

            $currentMaxOrder = $publicacion->media()->max('orden') ?? -1;
            $index = 0;

            while ($request->hasFile("media.{$index}.file")) {
                try {
                    $file = $request->file("media.{$index}.file");
                    $tipo = $request->input("media.{$index}.tipo");
                    $path = $file->store('publicaciones', 'public');

                    PublicacionMedia::create([
                        'publicacion_id' => $publicacion->id,
                        'tipo' => $tipo,
                        'url' => $path,
                        'orden' => $currentMaxOrder + $index + 1,
                    ]);
                } catch (\Exception $e) {
                    Log::error("Error procesando nueva media: " . $e->getMessage());
                }

                $index++;
            }
        }

        return redirect()->route('publicaciones.misPublicaciones')
            ->with('success', 'Publicación actualizada exitosamente');
    }

    /**
     * Elimina una publicación (soft delete)
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $publicacion = Publicacion::findOrFail($id);

        if ($publicacion->perf_institucion_id !== $user->institucion->id) {
            abort(403, 'No tienes permiso para eliminar esta publicación');
        }

        $publicacion->delete();

        return redirect()->back()
            ->with('success', 'Publicación eliminada exitosamente');
    }
}
