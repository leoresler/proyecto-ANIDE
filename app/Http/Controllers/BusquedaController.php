<?php

namespace App\Http\Controllers;

use App\Models\Publicacion;
use App\Models\PerfInstitucion;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BusquedaController extends Controller
{
    /**
     * Buscar en tiempo real (API endpoint para el dropdown)
     */
    public function buscarApi(Request $request)
    {
        try {
            $query = $request->input('q', '');

            if (strlen($query) < 2) {
                return response()->json([
                    'publicaciones' => [],
                    'instituciones' => []
                ]);
            }

            // Buscar publicaciones
            $publicaciones = Publicacion::query()
                ->where(function ($q) use ($query) {
                    $q->where('titulo', 'LIKE', "%{$query}%")
                        ->orWhere('contenido', 'LIKE', "%{$query}%");
                })
                ->where('publicado', true)
                ->with(['institucion.user'])
                ->select('id', 'titulo', 'contenido', 'perf_institucion_id', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(15)
                ->get();

            // Buscar instituciones
            $instituciones = PerfInstitucion::query()
                ->whereHas('user', function ($q) use ($query) {
                    $q->where('nombre', 'LIKE', "%{$query}%")
                        ->where('tipo_usuario', 'institucion')
                        ->where('estado', 'activo');
                })
                ->where('verificado', true)
                ->with('user:id,nombre,email,telefono,ciudad,provincia,profile_photo_path')
                ->select('id', 'user_id', 'descripcion', 'tipo_institucion', 'direccion')
                ->limit(15)
                ->get()
                ->map(function ($institucion) {
                    return [
                        'id' => $institucion->id,
                        'user_id' => $institucion->user_id,
                        'nombre' => $institucion->user->nombre ?? 'Sin nombre',
                        'descripcion' => $institucion->descripcion,
                        'foto_perfil' => $institucion->user->profile_photo_url ?? null,
                        'tipo_institucion' => $institucion->tipo_institucion,
                        'direccion' => $institucion->direccion,
                        'ciudad' => $institucion->user->ciudad ?? null,
                        'provincia' => $institucion->user->provincia ?? null,
                    ];
                });

            return response()->json([
                'publicaciones' => $publicaciones,
                'instituciones' => $instituciones
            ]);
        } catch (\Exception $e) {
            Log::error('Error en búsqueda: ' . $e->getMessage());
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Pagina principal de busqueda con paginacion
     */
    public function index(Request $request)
    {
        $query = $request->input('q', '');

        $publicaciones = [];
        $instituciones = [];

        if (strlen($query) >= 2) {
            // Buscar publicaciones con paginacion
            $publicaciones = Publicacion::query()
                ->where(function ($q) use ($query) {
                    $q->where('titulo', 'LIKE', "%{$query}%")
                        ->orWhere('contenido', 'LIKE', "%{$query}%");
                })
                ->where('publicado', true)
                ->with(['institucion.user', 'media', 'likes', 'comentarios', 'favoritos'])
                ->withCount(['likes', 'comentarios'])
                ->latest()
                ->paginate(10, ['*'], 'pub_page')
                ->withQueryString();

            // Buscar instituciones con paginación
            $institucionesQuery = PerfInstitucion::query()
                ->whereHas('user', function ($q) use ($query) {
                    $q->where('nombre', 'LIKE', "%{$query}%")
                        ->where('tipo_usuario', 'institucion')
                        ->where('estado', 'activo');
                })
                ->where('verificado', true)
                ->with('user:id,nombre,email,telefono,ciudad,provincia,profile_photo_path')
                ->paginate(10, ['*'], 'inst_page')
                ->withQueryString();

            // Transformar instituciones para incluir datos del usuario
            $institucionesQuery->getCollection()->transform(function ($institucion) {
                $institucion->nombre = $institucion->user->nombre ?? 'Sin nombre';
                $institucion->ciudad = $institucion->user->ciudad ?? null;
                $institucion->provincia = $institucion->user->provincia ?? null;
                $institucion->foto_perfil = $institucion->user->profile_photo_url ?? null;
                return $institucion;
            });


            $instituciones = $institucionesQuery;
        }

        return Inertia::render('Busqueda/Index', [
            'query' => $query,
            'publicaciones' => $publicaciones,
            'instituciones' => $instituciones,
            'userType' => Auth::user()
        ]);
    }
}
