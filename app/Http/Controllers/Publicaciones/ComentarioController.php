<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\ActividadController;
use App\Http\Controllers\Controller;
use App\Models\ComentPublicacion;
use App\Services\OpenAIModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Events\ComentarioCreado;
use App\Events\RespuestaComentarioEvent;
use App\Notifications\RespuestaComentarioNotification;



class ComentarioController extends Controller
{
    protected $moderationService;

    public function __construct(OpenAIModerationService $moderationService)
    {
        $this->moderationService = $moderationService;
    }

    /**
     * Almacena un nuevo comentario
     * Bloquea comentarios con palabras prohibidas
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'publicacion_id' => 'required|exists:publicaciones,id',
            'contenido' => 'required|string|max:1000',
            'coment_padre_id' => 'nullable|exists:coment_publicaciones,id',
        ]);

        $user = Auth::user();

        // Moderar el contenido ANTES de permitir su publicación
        $moderationResult = $this->moderationService->moderate($validated['contenido']);

        if (!$moderationResult['is_safe']) {
            $detectedCount = count($moderationResult['detected_words'] ?? []);

            return response()->json([
                'success' => false,
                'blocked' => true,
                'detected_words_count' => $detectedCount,
                'message' => $moderationResult['message'],
            ], 422);
        }

        $comentarioData = [
            'publicacion_id' => $validated['publicacion_id'],
            'contenido' => $validated['contenido'], // guardar texto original
            'coment_padre_id' => $validated['coment_padre_id'] ?? null,
        ];

        if ($user->tipo_usuario === 'persona') {
            $comentarioData['perf_persona_id'] = $user->persona->id;
        } else {
            $comentarioData['perf_institucion_id'] = $user->institucion->id;
        }

        $comentario = ComentPublicacion::create($comentarioData);

        Log::info('Comentario creado:', [
            'id' => $comentario->id,
            'contenido' => $comentario->contenido,
            'coment_padre_id' => $comentario->coment_padre_id,
            'user_id' => $user->id,
        ]);

        if (!$comentario->coment_padre_id) {
        Log::info('Disparando evento ComentarioCreado para comentario normal', ['id' => $comentario->id]);
        
        // 👇 VERIFICAR ANTES DE DISPARAR EL EVENTO
        $publicacion = $comentario->publicacion;
        $duenoPublicacion = $publicacion->institucion->user;
        
        if ($user->id !== $duenoPublicacion->id) {
            event(new ComentarioCreado($comentario));
        }
    } else {
        $comentarioPadre = ComentPublicacion::find($comentario->coment_padre_id);
        
        // 👇 VERIFICAR ANTES DE DISPARAR EL EVENTO
        $receptorPadre = $comentarioPadre->persona?->user ?? $comentarioPadre->institucion?->user;
        
        if ($receptorPadre && $receptorPadre->id !== $user->id) {
            Log::info('Disparando evento RespuestaComentarioEvent para comentario hijo', [
                'comentario_id' => $comentario->id,
                'coment_padre_id' => $comentario->coment_padre_id,
            ]);
            
            event(new RespuestaComentarioEvent($comentario));
            $receptorPadre->notify(new RespuestaComentarioNotification($comentario));
        }
    }
        

        $comentario = ComentPublicacion::with([
            'persona.user',
            'institucion.user',
            'likes'
        ])->find($comentario->id);

        Log::info('Comentario final con relaciones cargadas:', ['comentario' => $comentario]);

        ActividadController::registrar(
            $user->id,
            'comentario',
            'publicacion',
            $validated['publicacion_id'],
            'Comentaste una publicación',
            ['comentario' => $validated['contenido']]
        );
        
        return response()->json([
            'success' => true,
            'comentario' => $comentario,
            'message' => 'Comentario publicado exitosamente',
        ]);
    }


        /**
         * Elimina un comentario (soft delete)
         */
        public function destroy($id)
        {
            $user = Auth::user();
            $comentario = ComentPublicacion::with('publicacion')->findOrFail($id);

            $puedeEliminar = false;

            // Verificar si es el dueño del comentario
            if ($user->tipo_usuario === 'persona' && $comentario->perf_persona_id === $user->persona->id) {
                $puedeEliminar = true;
            } elseif ($user->tipo_usuario === 'institucion' && $comentario->perf_institucion_id === $user->institucion->id) {
                $puedeEliminar = true;
            }

            // Verificar si es el dueño de la publicación
            if (
                $user->tipo_usuario === 'institucion' &&
                $comentario->publicacion->perf_institucion_id === $user->institucion->id
            ) {
                $puedeEliminar = true;
            }

            if (!$puedeEliminar) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permiso para eliminar este comentario',
                ], 403);
            }

            $comentario->update([
                'eliminado' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Comentario eliminado exitosamente',
            ]);
        }
    }
