<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\Controller;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            // Si existe, eliminar (unlike)
            $like->delete();
            return response()->json([
                'success' => true,
                'action' => 'unliked',
                'message' => 'Like eliminado',
            ]);
        } else {
            // Si no existe, crear (like)
            Like::create([
                $perfKey => $perfId,
                'target_id' => $validated['target_id'],
                'target_tipo' => $validated['target_tipo'],
            ]);
            return response()->json([
                'success' => true,
                'action' => 'liked',
                'message' => 'Like agregado',
            ]);
        }
    }
}