<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\ActividadController;
use App\Http\Controllers\Controller;
use App\Models\ComentPublicacion;
use App\Services\OpenAIModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

        Log::info('Intento de comentario', [
            'user_id' => $user->id,
            'is_safe' => $moderationResult['is_safe'],
            'detected_words' => $moderationResult['detected_words'] ?? [],
        ]);

        // Si el comentario NO es seguro, bloquearlo completamente
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

        // Agregar el ID según el tipo de usuario
        if ($user->tipo_usuario === 'persona') {
            $comentarioData['perf_persona_id'] = $user->persona->id;
        } else {
            $comentarioData['perf_institucion_id'] = $user->institucion->id;
        }

        $comentario = ComentPublicacion::create($comentarioData);

        ActividadController::registrar(
            $user->id,
            'comentario',
            'publicacion',
            $validated['publicacion_id'],
            'Comentaste una publicación',
            ['comentario' => $validated['contenido']]
        );

        // Cargar relaciones para devolver el comentario completo
        $comentario = ComentPublicacion::with([
            'persona.user',
            'institucion.user',
            'likes'
        ])->find($comentario->id);

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
