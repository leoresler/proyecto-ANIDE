<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\ActividadController;
use App\Http\Controllers\Controller;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\LikeCreado;

class LikeController extends Controller
{
    /**
     * Toggle (crear o eliminar) like en una publicación o comentario
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'target_id' => 'required|integer',
            'target_tipo' => 'required|in:publicacion,comentario',
        ]);

        $user = Auth::user();

        // Identificar perfil
        // Obtener el ID del perfil segun el tipo de usuario
        if ($user->tipo_usuario === 'persona') {
            $perfId = $user->persona->id;
            $perfKey = 'perf_persona_id';
        } else {
            $perfId = $user->institucion->id;
            $perfKey = 'perf_institucion_id';
        }

        // Buscar si ya existe el like
        $like = Like::where([
            $perfKey => $perfId,
            'target_id' => $validated['target_id'],
            'target_tipo' => $validated['target_tipo'],
        ])->first();

        if ($like) {
            // Si existe, eliminar
            $like->delete();

            ActividadController::registrar(
                $user->id,
                'unlike',
                'publicacion',
                $validated['target_id'],
                'Quitaste tu like'
            );

            return response()->json([
                'success' => true,
                'action' => 'unliked',
                'message' => 'Like eliminado',
            ]);
        } else {
            // Si no existe, crear (like)
            $like = Like::create([
                $perfKey => $perfId,
                'target_id' => $validated['target_id'],
                'target_tipo' => $validated['target_tipo'],
            ]);
            
            // 👇 CAMBIAR TODA ESTA PARTE
            // Determinar el dueño según el tipo de target
            $duenoUserId = null;
            
            if ($validated['target_tipo'] === 'publicacion') {
                $publicacion = $like->publicacion;
                $duenoUserId = $publicacion->institucion->user->id;
            } elseif ($validated['target_tipo'] === 'comentario') {
                $comentario = $like->comentario;
                // El dueño del comentario puede ser persona o institución
                $duenoUserId = $comentario->persona?->user->id 
                            ?? $comentario->institucion?->user->id;
            }
            
            // Solo hacer broadcast si NO eres el dueño
            if ($duenoUserId && $user->id !== $duenoUserId) {
                broadcast(new LikeCreado($like))->toOthers();
            }

            ActividadController::registrar(
                $user->id,
                'like',
                $validated['target_tipo'], // 👈 Usar el tipo correcto
                $validated['target_id'],
                'Te gustó ' . ($validated['target_tipo'] === 'publicacion' ? 'una publicación' : 'un comentario')
            );

            return response()->json([
                'success' => true,
                'action' => 'liked',
                'message' => 'Like agregado',
            ]);
        }
    }
}
