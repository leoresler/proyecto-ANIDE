<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\Controller;
use App\Models\ComentPublicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ComentarioController extends Controller
{
    /**
     * Almacena un nuevo comentario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'publicacion_id' => 'required|exists:publicaciones,id',
            'contenido' => 'required|string|max:1000',
            'coment_padre_id' => 'nullable|exists:coment_publicaciones,id',
        ]);

        $user = Auth::user();

        // solo personas pueden comentar
        if ($user->tipo_usuario !== 'persona') {
            return response()->json([
                'success' => false,
                'message' => 'Solo las personas pueden comentar',
            ], 403);
        }

        $comentario = ComentPublicacion::create([
            'publicacion_id' => $validated['publicacion_id'],
            'perf_persona_id' => $user->persona->id,
            'contenido' => $validated['contenido'],
            'coment_padre_id' => $validated['coment_padre_id'] ?? null,
        ]);

        // cargar relaciones para devolver el comentario completo
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
        $comentario = ComentPublicacion::findOrFail($id);

        // Verificar que el comentario pertenece al usuario
        if ($comentario->perf_persona_id !== $user->persona->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para eliminar este comentario',
            ], 403);
        }

        $comentario->delete();

        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado exitosamente',
        ]);
    }
}
