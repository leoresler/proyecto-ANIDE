<?php

namespace App\Http\Controllers;

use App\Models\Residencia;
use App\Models\PerfInstitucion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ResidenciaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden gestionar residencias');
        }

        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if (!$institucion) {
            abort(404, 'Institución no encontrada');
        }

        $residencias = Residencia::where('perf_institucion_id', $institucion->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Residencias/Index', [
            'residencias' => $residencias
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            return back()->withErrors(['error' => 'Solo las instituciones pueden crear residencias']);
        }

        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if (!$institucion) {
            return back()->withErrors(['error' => 'Institución no encontrada']);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|min:3|max:255',
            'contacto' => 'required|string|max:255',
            'capacidad' => 'nullable|integer|min:1',
            'ciudad' => 'required|string|max:100',
            'provincia' => 'required|string|max:100',
            'direccion' => 'required|string|min:5|max:255',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'info_adicional' => 'nullable|string|max:1000',
            'foto_portada' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:4096',
        ], [
            'nombre.required' => 'El nombre es obligatorio',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres',
            'contacto.required' => 'El contacto es obligatorio',
            'capacidad.min' => 'La capacidad debe ser al menos 1',
            'direccion.required' => 'La dirección es obligatoria',
            'direccion.min' => 'La dirección debe tener al menos 5 caracteres',
            'latitud.required' => 'La latitud es obligatoria',
            'longitud.required' => 'La longitud es obligatoria',
            'foto_portada.image' => 'El archivo debe ser una imagen',
            'foto_portada.max' => 'La imagen no puede superar los 4MB',
        ]);

        // Construir la dirección completa
        $direccionCompleta = "{$validated['direccion']}, {$validated['ciudad']}, {$validated['provincia']}";

        $residenciaData = [
            'perf_institucion_id' => $institucion->id,
            'nombre' => $validated['nombre'],
            'direccion' => $direccionCompleta,
            'contacto' => $validated['contacto'],
            'capacidad' => $validated['capacidad'] ?? null,
            'latitud' => $validated['latitud'],
            'longitud' => $validated['longitud'],
            'info_adicional' => $validated['info_adicional'] ?? null,
        ];

        // Guardar foto si existe, sino asignar default
        if ($request->hasFile('foto_portada')) {
            $path = $request->file('foto_portada')->store('residencias', 'public');
            $residenciaData['foto_portada'] = $path;
        } else {
            $residenciaData['foto_portada'] = 'images/residencia-default.webp';
        }

        $residencia = Residencia::create($residenciaData);

        return back()->with('success', 'Residencia creada exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $residencia = Residencia::with('institucion.user')->findOrFail($id);

        return Inertia::render('Residencias/Show', [
            'residencia' => $residencia
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $residencia = Residencia::findOrFail($id);
        $user = Auth::user();

        // Verificar que el usuario es dueño de la residencia
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if (!$institucion || $residencia->perf_institucion_id !== $institucion->id) {
            abort(403, 'No tienes permisos para editar esta residencia');
        }

        $validated = $request->validate([
            'nombre' => 'required|string|min:3|max:255',
            'contacto' => 'required|string|max:255',
            'capacidad' => 'nullable|integer|min:1',
            'ciudad' => 'required|string|max:100',
            'provincia' => 'required|string|max:100',
            'direccion' => 'required|string|min:5|max:255',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'info_adicional' => 'nullable|string|max:1000',
            'foto_portada' => 'nullable|image|mimes:jpeg,jpg,png|max:4096',
        ]);

        // Construir la dirección completa
        $direccionCompleta = "{$validated['direccion']}, {$validated['ciudad']}, {$validated['provincia']}";

        $residenciaData = [
            'nombre' => $validated['nombre'],
            'direccion' => $direccionCompleta,
            'contacto' => $validated['contacto'],
            'capacidad' => $validated['capacidad'] ?? null,
            'latitud' => $validated['latitud'],
            'longitud' => $validated['longitud'],
            'info_adicional' => $validated['info_adicional'] ?? null,
        ];

        // Actualizar foto si existe
        if ($request->hasFile('foto_portada')) {
            // Eliminar foto anterior si existe
            if ($residencia->foto_portada) {
                Storage::disk('public')->delete($residencia->foto_portada);
            }

            $path = $request->file('foto_portada')->store('residencias', 'public');
            $residenciaData['foto_portada'] = $path;
        }

        $residencia->update($residenciaData);

        return back()->with('success', 'Residencia actualizada exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $residencia = Residencia::findOrFail($id);
        $user = Auth::user();

        // Verificar que el usuario es dueño de la residencia
        $institucion = PerfInstitucion::where('user_id', $user->id)->first();

        if (!$institucion || $residencia->perf_institucion_id !== $institucion->id) {
            abort(403, 'No tienes permisos para eliminar esta residencia');
        }

        // Eliminar foto si existe
        if ($residencia->foto_portada) {
            Storage::disk('public')->delete($residencia->foto_portada);
        }

        $residencia->delete();

        return back()->with('success', 'Residencia eliminada exitosamente');
    }

    /**
     * Get all residencias for map (public)
     */
    public function getAllForMap()
    {
        $residencias = Residencia::with('institucion.user')
            ->whereNotNull('latitud')
            ->whereNotNull('longitud')
            ->get()
            ->map(function ($residencia) {
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
                    'institucion' => [
                        'id' => $residencia->institucion->id,
                        'nombre' => $residencia->institucion->nombre,
                    ]
                ];
            });

        return response()->json($residencias);
    }

    /**
     * Get residencias by institucion ID
     */
    public function getByInstitucion($institucionId)
    {
        $residencias = Residencia::where('perf_institucion_id', $institucionId)
            ->whereNotNull('latitud')
            ->whereNotNull('longitud')
            ->get()
            ->map(function ($residencia) {
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
            });

        return response()->json($residencias);
    }
}
