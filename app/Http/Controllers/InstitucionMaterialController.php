<?php

namespace App\Http\Controllers;

use App\Models\InstitucionMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InstitucionMaterialController extends Controller
{
    /**
     * Muestra la lista de materiales de la institución
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'No tienes permiso para acceder a esta página');
        }

        $materiales = InstitucionMaterial::where('perf_institucion_id', $user->institucion->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Materiales/Index', [
            'materiales' => $materiales,
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo material
     */
    public function create()
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden crear materiales');
        }

        return Inertia::render('Materiales/Create');
    }

    /**
     * Almacena un nuevo material
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->tipo_usuario !== 'institucion') {
            abort(403, 'Solo las instituciones pueden crear materiales');
        }

        $validated = $request->validate([
            'tipo' => 'required|in:curso,carrera',
            'nombre' => 'required|string|max:255',
            'contenido' => 'required|string',
            'categorias' => 'required|array|min:1|max:5',
            'categorias.*' => 'string|max:255',
            'duracion' => 'nullable|integer|min:1',
            'modalidad' => 'nullable|string|in:Presencial,Virtual,Híbrida',
            'publicado' => 'nullable|boolean',
            'plan_estudios' => 'nullable|array',
            'plan_estudios.*' => 'file|mimes:pdf|max:10240', // 10MB max por archivo
        ]);

        // Procesar archivos PDF del plan de estudios
        $planesEstudiosPaths = [];

        if ($request->hasFile('plan_estudios')) {
            foreach ($request->file('plan_estudios') as $file) {
                try {
                    $path = $file->store('planes-estudio', 'public');
                    $planesEstudiosPaths[] = $path;
                } catch (\Exception $e) {
                    Log::error("Error guardando plan de estudios: " . $e->getMessage());
                }
            }
        }

        // Crear el material
        $material = InstitucionMaterial::create([
            'perf_institucion_id' => $user->institucion->id,
            'tipo' => $validated['tipo'],
            'nombre' => $validated['nombre'],
            'contenido' => $validated['contenido'],
            'categorias' => $validated['categorias'],
            'duracion' => $validated['duracion'] ?? null,
            'modalidad' => $validated['modalidad'] ?? null,
            'publicado' => $request->input('publicado', true),
            'plan_estudios' => !empty($planesEstudiosPaths) ? $planesEstudiosPaths : null,
        ]);

        return redirect()->route('materiales.index')
            ->with('success', ucfirst($validated['tipo']) . ' creado exitosamente');
    }

    /**
     * Muestra el formulario de edición
     */
    public function edit($id)
    {
        $user = Auth::user();
        $material = InstitucionMaterial::findOrFail($id);

        if ($material->perf_institucion_id !== $user->institucion->id) {
            abort(403, 'No tienes permiso para editar este material');
        }

        return Inertia::render('Materiales/Edit', [
            'material' => $material,
        ]);
    }

    /**
     * Actualiza un material existente
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $material = InstitucionMaterial::findOrFail($id);

        if ($material->perf_institucion_id !== $user->institucion->id) {
            abort(403, 'No tienes permiso para editar este material');
        }

        $validated = $request->validate([
            'tipo' => 'required|in:curso,carrera',
            'nombre' => 'required|string|max:255',
            'contenido' => 'required|string',
            'categorias' => 'required|array|min:1|max:5',
            'categorias.*' => 'string|max:255',
            'duracion' => 'nullable|integer|min:1',
            'modalidad' => 'nullable|string|in:Presencial,Virtual,Híbrida',
            'publicado' => 'nullable|boolean',
            'plan_estudios' => 'nullable|array',
            'plan_estudios.*' => 'file|mimes:pdf|max:10240',
            'deleted_planes' => 'nullable|array',
        ]);

        // Eliminar planes marcados para eliminación
        if ($request->has('deleted_planes') && is_array($request->input('deleted_planes'))) {
            $currentPlanes = $material->plan_estudios ?? [];
            foreach ($request->input('deleted_planes') as $planPath) {
                if (in_array($planPath, $currentPlanes)) {
                    Storage::disk('public')->delete($planPath);
                    $currentPlanes = array_values(array_diff($currentPlanes, [$planPath]));
                }
            }
            $material->plan_estudios = !empty($currentPlanes) ? $currentPlanes : null;
        }

        // Agregar nuevos planes
        if ($request->hasFile('plan_estudios')) {
            $planesActuales = $material->plan_estudios ?? [];

            foreach ($request->file('plan_estudios') as $file) {
                try {
                    $path = $file->store('planes-estudio', 'public');
                    $planesActuales[] = $path;
                } catch (\Exception $e) {
                    Log::error("Error guardando plan de estudios: " . $e->getMessage());
                }
            }

            $material->plan_estudios = $planesActuales;
        }

        // Actualizar el material
        $material->update([
            'tipo' => $validated['tipo'],
            'nombre' => $validated['nombre'],
            'contenido' => $validated['contenido'],
            'categorias' => $validated['categorias'],
            'duracion' => $validated['duracion'] ?? null,
            'modalidad' => $validated['modalidad'] ?? null,
            'publicado' => $request->input('publicado', true),
        ]);

        return redirect()->route('materiales.index')
            ->with('success', ucfirst($validated['tipo']) . ' actualizado exitosamente');
    }

    /**
     * Elimina un material (soft delete)
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $material = InstitucionMaterial::findOrFail($id);

        if ($material->perf_institucion_id !== $user->institucion->id) {
            abort(403, 'No tienes permiso para eliminar este material');
        }

        $material->delete();

        return redirect()->back()
            ->with('success', ucfirst($material->tipo) . ' eliminado exitosamente');
    }

    /**
     * API: Obtener recomendaciones para el usuario actual
     */
    public function recomendaciones()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['materiales' => [], 'instituciones' => []]);
        }

        // Obtener intereses del usuario
        $perfil = $user->tipo_usuario === 'persona' ? $user->persona : $user->institucion;
        $interesesUsuario = $perfil->interests ?? [];

        if (empty($interesesUsuario)) {
            return response()->json(['materiales' => [], 'instituciones' => []]);
        }

        // Obtener materiales recomendados
        $materiales = InstitucionMaterial::publicados()
            ->porIntereses($interesesUsuario)
            ->with(['institucion.user'])
            ->recientes()
            ->limit(5)
            ->get()
            ->map(function ($material) use ($interesesUsuario) {
                $categorias = is_array($material->categorias) ? $material->categorias : json_decode($material->categorias, true);
                $material->relevance_score = collect($categorias)
                    ->intersect($interesesUsuario)
                    ->count();
                $material->foto = $material->foto_institucion;
                return $material;
            })
            ->sortByDesc('relevance_score')
            ->values();

        // Obtener instituciones recomendadas (que tengan intereses similares)
        $instituciones = \App\Models\PerfInstitucion::where('verificado', true)
            ->whereNotNull('interests')
            ->whereHas('user', function ($q) {
                $q->where('estado', 'activo');
            })
            ->with('user')
            ->get()
            ->filter(function ($institucion) use ($interesesUsuario) {
                $interesesInst = is_array($institucion->interests)
                    ? $institucion->interests
                    : json_decode($institucion->interests, true);

                if (empty($interesesInst)) return false;

                return !empty(array_intersect($interesesUsuario, $interesesInst ?? []));
            })
            ->map(function ($institucion) use ($interesesUsuario) {
                $interesesInst = is_array($institucion->interests)
                    ? $institucion->interests
                    : json_decode($institucion->interests, true);

                $institucion->relevance_score = count(array_intersect($interesesUsuario, $interesesInst ?? []));
                $institucion->nombre = $institucion->user->nombre ?? 'Sin nombre';
                $institucion->foto = $institucion->foto_perfil ?? $institucion->user->profile_photo_url;
                return $institucion;
            })
            ->sortByDesc('relevance_score')
            ->take(3)
            ->values();

        return response()->json([
            'materiales' => $materiales,
            'instituciones' => $instituciones,
        ]);
    }
}
