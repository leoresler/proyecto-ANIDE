<?php

namespace App\Http\Controllers\Publicaciones;

use App\Http\Controllers\Controller;
use App\Models\Favorito;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoritoController extends Controller
{
    /**
     * Toggle favorito en una publicación
     * Solo personas pueden guardar favoritos
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'publicacion_id' => 'required|exists:publicaciones,id',
        ]);

        $user = Auth::user();

        // Solo personas pueden guardar favoritos
        if ($user->tipo_usuario !== 'persona') {
            return response()->json([
                'success' => false,
                'message' => 'Solo las personas pueden guardar publicaciones en favoritos',
            ], 403);
        }

        $favorito = Favorito::where([
            'perf_persona_id' => $user->persona->id,
            'publicacion_id' => $validated['publicacion_id'],
        ])->first();

        if ($favorito) {
            // Si existe, eliminar
            $favorito->delete();
            return response()->json([
                'success' => true,
                'action' => 'removed',
                'message' => 'Publicación eliminada de favoritos',
            ]);
        } else {
            // Si no existe, crear
            Favorito::create([
                'perf_persona_id' => $user->persona->id,
                'publicacion_id' => $validated['publicacion_id'],
            ]);
            return response()->json([
                'success' => true,
                'action' => 'added',
                'message' => 'Publicación agregada a favoritos',
            ]);
        }
    }

    /**
     * Lista de publicaciones favoritas del usuario
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'persona') {
            abort(403, 'Solo las personas tienen acceso a favoritos');
        }

        $favoritos = Favorito::with([
            'publicacion.institucion.user',
            'publicacion.media',
            'publicacion.likes',
        ])
            ->where('perf_persona_id', $user->persona->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $publicaciones = $favoritos->through(function ($fav) use ($user) {
            $pub = $fav->publicacion;
            if ($pub) {
                $pub->is_favorite = true;

                // Contador de likes
                $pub->likes_count = $pub->likes ? $pub->likes->count() : 0;

                // Si el usuario actual ya dio like
                if ($user->tipo_usuario === 'persona') {
                    $pub->user_has_liked = $pub->likes->contains('perf_persona_id', $user->persona->id);
                } else {
                    $pub->user_has_liked = $pub->likes->contains('perf_institucion_id', $user->institucion->id);
                }
            }
            return $pub;
        });

        return inertia('Favoritos/Index', [
            'auth' => ['user' => $user],
            'userType' => $user->tipo_usuario,
            'favoritos' => $publicaciones,
        ]);
    }
}
