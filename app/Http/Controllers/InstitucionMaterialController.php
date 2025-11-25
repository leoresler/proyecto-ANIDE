<?php

namespace App\Http\Controllers;

use App\Models\InstitucionMaterial;
use App\Models\MaterialGuardado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('Material/Index', [
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

        return Inertia::render('Material/Create');
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
            'plan_estudios.*' => 'file|mimes:pdf|max:10240',
        ]);

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

        return redirect()->route('material.index')
            ->with('success', ucfirst($validated['tipo']) . ' creado exitosamente');
    }

    /**
     * Muestra el detalle de un material (PÚBLICO para usuarios logueados)
     */
    public function show($id)
    {
        $material = InstitucionMaterial::with(['institucion.user'])
            ->findOrFail($id);

        $user = Auth::user();
        $esOwner = $user->tipo_usuario === 'institucion' &&
            $material->perf_institucion_id === $user->institucion->id;

        if (!$material->publicado && !$esOwner) {
            abort(404, 'Material no encontrado');
        }

        $guardado = MaterialGuardado::where('user_id', $user->id)
            ->where('material_id', $material->id)
            ->exists();

        $material->nombre_institucion = $material->institucion?->user?->nombre ?? 'Institución desconocida';
        $material->foto_institucion = $material->institucion?->foto_perfil
            ?? $material->institucion?->user?->profile_photo_url
            ?? '/profile-photos/default-avatar.webp';


        ActividadController::registrar(
            $user->id,
            'vista',
            'material',
            $id,
            'Viste un curso/carrera'
        );

        return Inertia::render('Material/Show', [
            'material' => $material,
            'guardado' => $guardado,
            'esOwner' => $esOwner,
        ]);
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

        return Inertia::render('Material/Edit', [
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

        // Eliminar planes marcados
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

        // Actualizar
        $material->update([
            'tipo' => $validated['tipo'],
            'nombre' => $validated['nombre'],
            'contenido' => $validated['contenido'],
            'categorias' => $validated['categorias'],
            'duracion' => $validated['duracion'] ?? null,
            'modalidad' => $validated['modalidad'] ?? null,
            'publicado' => $request->input('publicado', true),
        ]);

        return redirect()->route('material.index')
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
     * Guardar/Quitar un material
     */
    public function toggleGuardado($id)
    {
        $user = Auth::user();
        $material = InstitucionMaterial::findOrFail($id);

        if (!$material->publicado) {
            return response()->json(['error' => 'Material no disponible'], 403);
        }

        $guardado = MaterialGuardado::where('user_id', $user->id)
            ->where('material_id', $material->id)
            ->first();

        if ($guardado) {
            $guardado->delete();

            ActividadController::registrar(
                $user->id,
                'quitar_guardado',
                'material',
                $id,
                'Quitaste un curso/carrera de guardados'
            );

            return response()->json(['guardado' => false, 'message' => 'Eliminado de guardados']);
        } else {
            MaterialGuardado::create([
                'user_id' => $user->id,
                'material_id' => $material->id,
            ]);

            ActividadController::registrar(
                $user->id,
                'guardado',
                'material',
                $id,
                'Guardaste un curso/carrera'
            );

            return response()->json(['guardado' => true, 'message' => 'Guardado exitosamente']);
        }
    }

    /**
     * Mis cursos guardados
     */
    public function misCursos()
    {
        $user = Auth::user();

        $cursos = InstitucionMaterial::whereHas('guardados', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->where('tipo', 'curso')
            ->where('publicado', true)
            ->with(['institucion.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return Inertia::render('Material/MisCursos', [
            'cursos' => $cursos,
        ]);
    }

    /**
     * Mis carreras guardadas
     */
    public function misCarreras()
    {
        $user = Auth::user();

        $carreras = InstitucionMaterial::whereHas('guardados', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->where('tipo', 'carrera')
            ->where('publicado', true)
            ->with(['institucion.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return Inertia::render('Material/MisCarreras', [
            'carreras' => $carreras,
        ]);
    }

    /**
     * API: Recomendaciones
     */
    public function recomendaciones()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['materiales' => [], 'instituciones' => []]);
        }

        $perfil = $user->tipo_usuario === 'persona' ? $user->persona : $user->institucion;
        $interesesUsuario = $perfil->interests ?? [];

        if (empty($interesesUsuario)) {
            return response()->json(['materiales' => [], 'instituciones' => []]);
        }

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
    /**
     * Lista todos los materiales públicos (para todos los usuarios)
     */
    public function listar()
    {
        $materiales = InstitucionMaterial::where('publicado', true)
            ->with(['institucion.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);


        $materiales->getCollection()->transform(function ($material) {
            $material->nombre_institucion = $material->institucion?->user?->nombre ?? 'Institución desconocida';
            $material->foto_institucion = $material->institucion?->foto_perfil
                ?? $material->institucion?->user?->profile_photo_url
                ?? '/images/default-avatar.png';
            return $material;
        });

        return Inertia::render('Material/ListarMaterial', [
            'materiales' => $materiales,
        ]);
    }
}
