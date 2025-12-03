<?php

namespace App\Http\Controllers;

use App\Models\PerfInstitucion;
use App\Models\Residencia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\UbicacionGuardada;

class MapaController extends Controller
{
    /**
     * Muestra el mapa interactivo de instituciones y residencias
     */
    public function index()
    {
         $user = auth()->user();
        // Obtener todas las instituciones verificadas con sus residencias
        $instituciones = PerfInstitucion::with(['user', 'residencias' => function($query) {
                // Asegurarse de cargar solo residencias que no estén eliminadas
                $query->whereNotNull('latitud')
                      ->whereNotNull('longitud');
            }])
            ->where('verificado', true)
            ->whereNotNull('latitud')
            ->whereNotNull('longitud')
            ->get()
            ->map(function ($institucion) {
                // Log para debugging
                Log::info('Institución: ' . $institucion->nombre . ' - Residencias: ' . $institucion->residencias->count());
                
                return [
                    'id' => $institucion->id,
                    'user_id' => $institucion->user_id,
                    'nombre' => $institucion->nombre,
                    'tipo_institucion' => $institucion->tipo_institucion,
                    'direccion' => $institucion->direccion,
                    'ciudad' => $institucion->ciudad,
                    'provincia' => $institucion->provincia,
                    'telefono' => $institucion->telefono,
                    'latitud' => (float) $institucion->latitud,
                    'longitud' => (float) $institucion->longitud,
                    'foto_perfil' => $institucion->foto_perfil,
                    'descripcion' => $institucion->descripcion,
                    'url_sitio_web' => $institucion->url_sitio_web,
                    'residencias' => $institucion->residencias->map(function ($residencia) {
                        Log::info('Residencia mapeada: ' . $residencia->nombre . ' - Lat: ' . $residencia->latitud . ' - Lng: ' . $residencia->longitud);
                        
                        return [
                            'id' => $residencia->id,
                            'nombre' => $residencia->nombre,
                            'direccion' => $residencia->direccion,
                            'contacto' => $residencia->contacto,
                            'latitud' => (float) $residencia->latitud,
                            'longitud' => (float) $residencia->longitud,
                            'capacidad' => $residencia->capacidad,
                            'foto_portada' => $residencia->foto_portada,
                            'info_adicional' => $residencia->info_adicional,
                        ];
                    })->values() // Asegurar que sea un array indexado
                ];
            });

        // Obtener tipos de institución únicos para el filtro
        $tiposInstitucion = PerfInstitucion::where('verificado', true)
            ->whereNotNull('tipo_institucion')
            ->distinct()
            ->pluck('tipo_institucion')
            ->filter()
            ->values();

        // Log del total de instituciones y residencias
        $totalResidencias = Residencia::whereHas('institucion', function($q) {
            $q->where('verificado', true);
        })->whereNotNull('latitud')->whereNotNull('longitud')->count();

        
        $ubicacionesGuardadas = [];
        if ($user) {
            if ($user->tipo_usuario === 'persona') {
                $ubicacionesGuardadas = UbicacionGuardada::where('persona_id', $user->persona->id)
                    ->get(['institucion_id'])
                    ->toArray();
            } else { // tipo_usuario === 'institucion'
                $ubicacionesGuardadas = UbicacionGuardada::where('guardador_institucion_id', $user->institucion->id)
                    ->get(['institucion_id'])
                    ->toArray();
            }
        }
        
        Log::info('Total instituciones en mapa: ' . $instituciones->count());
        Log::info('Total residencias en BD: ' . $totalResidencias);

        return Inertia::render('Mapa/Index', [
            'instituciones' => $instituciones,
            'tiposInstitucion' => $tiposInstitucion,
            'ubicacionesGuardadas' => $ubicacionesGuardadas,
        ]);
    }

    /**
     * Filtra instituciones según criterios (AJAX)
     */
    public function filtrar(Request $request)
    {
        $query = PerfInstitucion::with(['user', 'residencias' => function($query) {
                $query->whereNotNull('latitud')->whereNotNull('longitud');
            }])
            ->where('verificado', true)
            ->whereNotNull('latitud')
            ->whereNotNull('longitud');

        // Filtro por tipo de institución
        if ($request->filled('tipo_institucion')) {
            $query->where('tipo_institucion', $request->tipo_institucion);
        }

        // Filtro por área de estudio
        if ($request->filled('area_estudio')) {
            $query->where(function ($q) use ($request) {
                $q->where('descripcion', 'like', '%' . $request->area_estudio . '%')
                    ->orWhere('tipo_institucion', 'like', '%' . $request->area_estudio . '%');
            });
        }

        $instituciones = $query->get()->map(function ($institucion) {
            return [
                'id' => $institucion->id,
                'nombre' => $institucion->nombre,
                'tipo_institucion' => $institucion->tipo_institucion,
                'direccion' => $institucion->direccion,
                'ciudad' => $institucion->ciudad,
                'provincia' => $institucion->provincia,
                'telefono' => $institucion->telefono,
                'latitud' => (float) $institucion->latitud,
                'longitud' => (float) $institucion->longitud,
                'foto_perfil' => $institucion->foto_perfil,
                'descripcion' => $institucion->descripcion,
                'url_sitio_web' => $institucion->url_sitio_web,
                'residencias' => $institucion->residencias->map(function ($residencia) {
                    return [
                        'id' => $residencia->id,
                        'nombre' => $residencia->nombre,
                        'direccion' => $residencia->direccion,
                        'contacto' => $residencia->contacto,
                        'latitud' => (float) $residencia->latitud,
                        'longitud' => (float) $residencia->longitud,
                        'capacidad' => $residencia->capacidad,
                        'foto_portada' => $residencia->foto_portada,
                        'info_adicional' => $residencia->info_adicional,
                    ];
                })->values()
            ];
        });

        return response()->json($instituciones);
    }
}