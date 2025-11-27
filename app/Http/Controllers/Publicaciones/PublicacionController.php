<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\ActividadController;
use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\PublicacionMedia;
use App\Models\VisitaInstitucion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Notifications\UbicacionGuardadaNotification;

class PublicacionController extends Controller
{
    /**
     * Almacena una nueva publicación
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            // Solo instituciones pueden publicar
            if ($user->tipo_usuario !== 'institucion') {
                abort(403, 'Solo las instituciones pueden crear publicaciones');
            }

            // Verificar que el usuario tenga perfil de institución
            if (!$user->institucion) {
                return redirect()->back()->with('error', 'No se encontró perfil de institución para este usuario.');
            }

            // Validación
            $validated = $request->validate([
                'titulo' => 'required|string|max:255',
                'contenido' => 'required|string',
                'publicado' => 'nullable',
                'categorias' => 'required|array|min:1|max:5',
                'categorias.*' => 'string|max:255',
            ]);

            // Crear publicación
            $publicacion = Publicacion::create([
                'perf_institucion_id' => $user->institucion->id,
                'titulo' => $validated['titulo'],
                'contenido' => $validated['contenido'],
                'publicado' => $request->boolean('publicado', true),
                'categorias' => $validated['categorias'],
            ]);

            // Procesar archivos multimedia
            $index = 0;
            while ($request->hasFile("media.{$index}.file")) {
                try {
                    $file = $request->file("media.{$index}.file");
                    $tipo = $request->input("media.{$index}.tipo", 'imagen');

                    // Guardar archivo
                    $path = $file->store('publicaciones', 'public');

                    // Crear registro en DB
                    PublicacionMedia::create([
                        'publicacion_id' => $publicacion->id,
                        'tipo' => $tipo,
                        'url' => $path,
                        'orden' => $index,
                    ]);
                } catch (\Exception $e) {
                    Log::error("Error procesando media.{$index}.file: " . $e->getMessage(), [
                        'trace' => $e->getTraceAsString()
                    ]);
                }
                $index++;
            }

            // Enviar notificaciones a usuarios que guardaron la institución
            $institucion = $publicacion->institucion;
            $institucion->guardadaPorUsuarios->each(function ($persona) use ($publicacion) {
            if ($persona->user) {
                // Guardar en base de datos
                $persona->user->notify(new \App\Notifications\UbicacionGuardadaNotification($publicacion));
            }
        });

        // Enviar broadcast en tiempo real
        event(new \App\Events\PublicacionCreada($publicacion));


            return redirect()->route('publicaciones.misPublicaciones')
                ->with('success', 'Publicación creada exitosamente');
        } catch (\Throwable $e) {
            Log::error("Error al crear publicación: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return redirect()->back()->with('error', 'Hubo un error al crear la publicación');
        }
    }


    /**
     * Muestra el feed principal filtrado por intereses del usuario
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

        // Obtener intereses del usuario
        $perfil = $user->tipo_usuario === 'persona' ? $user->persona : $user->institucion;

        $interesesUsuario = [];
        if ($perfil && $perfil->interests) {
            $interesesUsuario = is_array($perfil->interests) ? $perfil->interests : [];
        }

        // Construir query base
        $query = Publicacion::with([
            'institucion.user',
            'media' => function ($query) {
                $query->orderBy('orden', 'asc');
            },
            'likes',
            'comentarios',
            'favoritos' => function ($query) use ($user) {
                if ($user->tipo_usuario === 'persona') {
                    $query->where('perf_persona_id', $user->persona->id);
                } else {
                    $query->where('perf_institucion_id', $user->institucion->id);
                }
            }
        ])
            ->where('publicado', true);

        // FILTRAR POR INTERESES si el usuario tiene intereses configurados
        if (!empty($interesesUsuario) && is_array($interesesUsuario)) {
            $query->where(function ($q) use ($interesesUsuario) {
                foreach ($interesesUsuario as $interes) {
                    $interesSafe = addslashes($interes);
                    $q->orWhere('categorias', 'LIKE', '%"' . $interesSafe . '"%');
                }
            });
        }

        $query->orderBy('created_at', 'desc');
        $publicaciones = $query->paginate(10);

        // Calcular relevancia y agregar información adicional
        $publicaciones->getCollection()->transform(function ($publicacion) use ($user, $interesesUsuario) {
            if (!empty($interesesUsuario)) {
                $categorias = is_array($publicacion->categorias)
                    ? $publicacion->categorias
                    : json_decode($publicacion->categorias, true);

                $publicacion->relevance_score = is_array($categorias)
                    ? collect($categorias)->intersect($interesesUsuario)->count()
                    : 0;
            } else {
                $publicacion->relevance_score = 0;
            }

            $publicacion->likes_count = $publicacion->likes->count();
            $publicacion->comentarios_count = $publicacion->comentarios->count();

            if ($user->tipo_usuario === 'persona') {
                $publicacion->user_has_liked = $publicacion->likes->contains(fn($like) => $like->perf_persona_id === $user->persona->id);
            } else {
                $publicacion->user_has_liked = $publicacion->likes->contains(fn($like) => $like->perf_institucion_id === $user->institucion->id);
            }

            $publicacion->is_favorite = $publicacion->favoritos->isNotEmpty();

            return $publicacion;
        });

        if (!empty($interesesUsuario)) {
            $sorted = $publicaciones->getCollection()
                ->sortByDesc(fn($pub) => [$pub->relevance_score, $pub->created_at->timestamp])
                ->values();
            $publicaciones->setCollection($sorted);
        }

        // Obtener instituciones visitadas recientemente (solo para personas)
        $institucionesVisitadas = [];
        if ($user->tipo_usuario === 'persona') {
            $institucionesVisitadas =   VisitaInstitucion::ultimasVisitadas($user->id, 5);
        }

        return Inertia::render('Inicio', [
            'publicaciones' => $publicaciones,
            'userType' => $user->tipo_usuario,
            'institucionesVisitadas' => $institucionesVisitadas,
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
                } else {
                    $query->where('perf_institucion_id', $user->institucion->id);
                }
            }
        ])->findOrFail($id);

        ActividadController::registrar(
            $user->id,
            'vista',
            'publicacion',
            $id,
            'Viste una publicación'
        );

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
            $publicacion->is_favorite = $publicacion->favoritos->isNotEmpty();
        }

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
            // Solo actualizar contenido si está publicada
            $validated = $request->validate([
                'contenido' => 'required|string',
            ]);

            $publicacion->update([
                'contenido' => $validated['contenido'],
            ]);
        } else {
            // Actualizar todo si es borrador
            $validated = $request->validate([
                'titulo' => 'required|string|max:255',
                'contenido' => 'required|string',
                'publicado' => 'nullable',
                'categorias' => 'required|array|min:1|max:5',
                'categorias.*' => 'string|max:255',
            ]);

            $publicacion->update([
                'titulo' => $validated['titulo'],
                'contenido' => $validated['contenido'],
                'publicado' => $request->input('publicado') == '1' || $request->input('publicado') == 1,
                'categorias' => $validated['categorias'],
            ]);

            // Eliminar media marcada
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

            // Agregar nueva media
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
