<?php

namespace App\Http\Controllers\Publicaciones;

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
            // dislike
            $like->delete();

            return response()->json([
                'success' => true,
                'action' => 'unliked',
            ]);
        }

        // Crear like (AHORA sí)
        $like = Like::create([
            $perfKey => $perfId,
            'target_id' => $validated['target_id'],
            'target_tipo' => $validated['target_tipo'],
        ]);

        // Enviar evento REAL con el $like creado
        broadcast(new LikeCreado($like))->toOthers();

        return response()->json([
            'success' => true,
            'action' => 'liked',
        ]);
    }

}