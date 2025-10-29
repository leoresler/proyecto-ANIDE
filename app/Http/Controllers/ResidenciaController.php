<?php

namespace App\Http\Controllers;

use App\Models\Residencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ResidenciaController extends Controller
{
    /**
     * Muestra todas las residencias de la institución autenticada
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden acceder a esta sección');
        }

        $institucion = $user->institucion;

        $residencias = Residencia::where('perf_institucion_id', $institucion->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Residencias/Index', [
            'residencias' => $residencias,
            'institucion' => $institucion,
        ]);
    }

    /**
     * Muestra el formulario para crear una nueva residencia
     */
    public function create()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden crear residencias');
        }

        return Inertia::render('Residencias/Create', [
            'institucion' => $user->institucion,
        ]);
    }

    /**
     * Almacena una nueva residencia
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden crear residencias');
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'capacidad' => 'nullable|integer|min:0',
            'foto_portada' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'info_adicional' => 'nullable|string|max:1000',
        ]);

        $validated['perf_institucion_id'] = $user->institucion->id;

        // Manejo de la foto de portada
        if ($request->hasFile('foto_portada')) {
            $path = $request->file('foto_portada')->store('residencias', 'public');
            $validated['foto_portada'] = $path;
        }

        $residencia = Residencia::create($validated);

        return redirect()->route('residencias.index')
            ->with('success', 'Residencia creada exitosamente');
    }

    /**
     * Muestra una residencia específica
     */
    public function show(Residencia $residencia)
    {
        $residencia->load('institucion.user');

        return Inertia::render('Residencias/Show', [
            'residencia' => $residencia,
        ]);
    }

    /**
     * Muestra el formulario para editar una residencia
     */
    public function edit(Residencia $residencia)
    {
        $user = Auth::user();

        // Verificar que la residencia pertenece a la institución del usuario
        if (
            $user->tipo_usuario !== 'institucion' ||
            $residencia->perf_institucion_id !== $user->institucion->id
        ) {
            abort(403, 'No tienes permiso para editar esta residencia');
        }

        return Inertia::render('Residencias/Edit', [
            'residencia' => $residencia,
        ]);
    }

    /**
     * Actualiza una residencia
     */
    public function update(Request $request, Residencia $residencia)
    {
        $user = Auth::user();

        // Verificar que la residencia pertenece a la institución del usuario
        if (
            $user->tipo_usuario !== 'institucion' ||
            $residencia->perf_institucion_id !== $user->institucion->id
        ) {
            abort(403, 'No tienes permiso para actualizar esta residencia');
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'capacidad' => 'nullable|integer|min:0',
            'foto_portada' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'info_adicional' => 'nullable|string|max:1000',
        ]);

        // Manejo de la foto de portada
        if ($request->hasFile('foto_portada')) {
            // Eliminar la foto anterior si existe
            if ($residencia->foto_portada) {
                Storage::disk('public')->delete($residencia->foto_portada);
            }

            $path = $request->file('foto_portada')->store('residencias', 'public');
            $validated['foto_portada'] = $path;
        }

        $residencia->update($validated);

        return redirect()->route('residencias.index')
            ->with('success', 'Residencia actualizada exitosamente');
    }

    /**
     * Elimina una residencia (soft delete)
     */
    public function destroy(Residencia $residencia)
    {
        $user = Auth::user();

        // Verificar que la residencia pertenece a la institución del usuario
        if (
            $user->tipo_usuario !== 'institucion' ||
            $residencia->perf_institucion_id !== $user->institucion->id
        ) {
            abort(403, 'No tienes permiso para eliminar esta residencia');
        }

        $residencia->delete();

        return redirect()->route('residencias.index')
            ->with('success', 'Residencia eliminada exitosamente');
    }

    /**
     * Obtiene todas las residencias de todas las instituciones (para el mapa público)
     */
    public function getAllForMap()
    {
        $residencias = Residencia::with(['institucion.user' => function ($query) {
            $query->select('id', 'nombre', 'ciudad', 'provincia');
        }])
            ->whereHas('institucion', function ($query) {
                $query->where('verificado', true);
            })
            ->get(['id', 'perf_institucion_id', 'nombre', 'direccion', 'contacto', 'latitud', 'longitud', 'capacidad']);

        return response()->json($residencias);
    }

    /**
     * Obtiene las residencias de una institución específica
     */
    public function getByInstitucion($institucionId)
    {
        $residencias = Residencia::where('perf_institucion_id', $institucionId)
            ->get(['id', 'nombre', 'direccion', 'latitud', 'longitud', 'capacidad']);

        return response()->json($residencias);
    }
}
