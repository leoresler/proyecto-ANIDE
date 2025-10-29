<?php

namespace App\Http\Controllers;

use App\Models\PerfInstitucion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MapaController extends Controller
{
    /**
     * Muestra el mapa interactivo de instituciones y residencias
     */
    public function index()
    {
        // Obtener todas las instituciones verificadas con sus residencias
        $instituciones = PerfInstitucion::with(['user', 'residencias'])
            ->where('verificado', true)
            ->whereNotNull('latitud')
            ->whereNotNull('longitud')
            ->get()
            ->map(function ($institucion) {
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
                    })
                ];
            });

        // Obtener tipos de institución únicos para el filtro
        $tiposInstitucion = PerfInstitucion::where('verificado', true)
            ->whereNotNull('tipo_institucion')
            ->distinct()
            ->pluck('tipo_institucion')
            ->filter()
            ->values();

        return Inertia::render('Mapa/Index', [
            'instituciones' => $instituciones,
            'tiposInstitucion' => $tiposInstitucion,
        ]);
    }

    /**
     * Filtra instituciones según criterios (AJAX)
     */
    public function filtrar(Request $request)
    {
        $query = PerfInstitucion::with(['user', 'residencias'])
            ->where('verificado', true)
            ->whereNotNull('latitud')
            ->whereNotNull('longitud');

        // Filtro por tipo de institución
        if ($request->filled('tipo_institucion')) {
            $query->where('tipo_institucion', $request->tipo_institucion);
        }

        // Filtro por área de estudio (buscar en descripción o en tabla relacionada si existe)
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
                })
            ];
        });

        // Aplicar filtro de distancia en el cliente si se proporciona
        return response()->json($instituciones);
    }
}
