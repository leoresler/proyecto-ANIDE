<?php

namespace App\Http\Controllers;

use App\Models\Actividad;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActividadController extends Controller
{
    public function index()
    {
        $actividades = Actividad::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Cargar los objetos relacionados
        $actividades->getCollection()->transform(function ($actividad) {
            $actividad->objeto = $actividad->objeto;
            return $actividad;
        });

        return Inertia::render('Actividad/Index', [
            'actividades' => $actividades,
        ]);
    }

    /**
     * Registrar una actividad
     */
    public static function registrar($userId, $tipo, $modelo, $modeloId, $descripcion = null, $metadata = [])
    {
        return Actividad::create([
            'user_id' => $userId,
            'tipo' => $tipo,
            'modelo' => $modelo,
            'modelo_id' => $modeloId,
            'descripcion' => $descripcion,
            'metadata' => $metadata,
        ]);
    }
}