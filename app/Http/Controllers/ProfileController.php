<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\PerfPersona;
use App\Models\PerfInstitucion;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\Like;
use App\Models\Publicacion;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $residencias = [];

        // Si es institución, cargar sus residencias
        if ($user->tipo_usuario === 'institucion') {
            $institucion = PerfInstitucion::where('user_id', $user->id)->first();
            if ($institucion) {
                $residencias = $institucion->residencias()
                    ->orderBy('created_at', 'desc')
                    ->get();
            }
        }

        $persona = $user->persona;
        $institucion = $user->institucion;

        // que perfil usa los intereses
        $perfil = $persona ?? $institucion;

        $interests = [];
        if ($perfil) {
            $interests = $perfil->interests;
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'auth' => [
                'user' => $request->user(),
            ],
            'residencias' => $residencias,
            'persona' => $persona,
            'institucion' => $institucion,
            'currentInterests' => $interests,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }


    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $path = $request->file('photo')->store('profile-photos', 'public');

        $user->profile_photo_path = $path;
        $user->save();

        return back()->with('success', 'Foto de perfil actualizada.');
    }

    public function destroyPhoto(Request $request)
    {
        $user = $request->user();

        if ($user->profile_photo_path && $user->profile_photo_path !== 'profile-photos/default-avatar.webp') {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->profile_photo_path = null;
        $user->save();

        return Inertia::location(route('profile.edit'));
    }

    public function updateInterests(Request $request): RedirectResponse
    {
        $request->validate([
            'interests' => 'array',
        ]);

        $user = $request->user();

        // Detectar perfil activo
        $perfil = $user->persona ?? $user->institucion;

        if (!$perfil) {
            return back()->withErrors(['interests' => 'No se encontró un perfil asociado.']);
        }

        $perfil->interests = json_encode($request->interests);
        $perfil->save();

        return back()->with('status', 'Intereses actualizados.');
    }

    /**
     * Validación personalizada para documentos argentinos
     */
    private function validateDocumento($tipoDocumento, $numeroDocumento)
    {
        // Limpiar el documento de caracteres especiales
        $cleanDoc = preg_replace('/[^0-9]/', '', $numeroDocumento);

        switch ($tipoDocumento) {
            case 'DNI':
                if (strlen($cleanDoc) < 7 || strlen($cleanDoc) > 8) {
                    return false;
                }
                break;
            case 'CUIT':
            case 'CUIL':
                if (strlen($cleanDoc) !== 11) {
                    return false;
                }
                break;
            default:
                return false;
        }

        return true;
    }

    /**
     * Completar los datos del usuario una vez verificado el email.
     */
    public function completarPerfil(Request $request)
    {
        $user = Auth::user();
        $tipoUsuario = $user->tipo_usuario;

        $rules = [
            'profile_photo_path' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048',
            'nombre' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'
            ],
            'telefono' => [
                'required',
                'string',
                'min:8',
                'max:20',
                'regex:/^[\d\s\-\+\(\)]+$/'
            ],
            'interests' => 'required|array|min:1',
            'interests.*' => 'string|max:255',
        ];

        if ($tipoUsuario === 'persona') {
            $rules['apellido'] = [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'
            ];
            $rules['fecha_nac'] = 'required|date|before:today|after:' . now()->subYears(120)->format('Y-m-d');
            $rules['biografia'] = 'nullable|string|max:500';
            $rules['ciudad'] = 'required|string|min:2|max:100';
            $rules['provincia'] = 'required|string|min:2|max:100';
        } else {
            $rules['tipo_institucion'] = 'required|string|min:3|max:100';
            $rules['tipo_institucion_otro'] = 'required_if:tipo_institucion,Otro|string|min:3|max:100';
            $rules['ciudad'] = 'required|string|min:2|max:100';
            $rules['provincia'] = 'required|string|min:2|max:100';
            $rules['direccion'] = 'required|string|min:5|max:255';
            $rules['latitud'] = 'required|numeric|between:-90,90';
            $rules['longitud'] = 'required|numeric|between:-180,180';
            $rules['url_sitio_web'] = 'nullable|url|max:255|regex:/^https?:\/\/.+\..+/';
            $rules['descripcion'] = 'nullable|string|max:1000';
            $rules['ano_fundacion'] = 'nullable|integer|min:1800|max:' . date('Y');
            $rules['tipo_documento'] = 'required|in:CUIT,CUIL,DNI';
            $rules['doc_identificador'] = 'required|string|max:20';
        }

        $validated = $request->validate($rules, [
            // Mensajes personalizados
            'nombre.required' => 'El nombre es obligatorio',
            'nombre.min' => 'El nombre debe tener al menos 2 caracteres',
            'nombre.regex' => 'El nombre solo puede contener letras',
            'apellido.required' => 'El apellido es obligatorio',
            'apellido.min' => 'El apellido debe tener al menos 2 caracteres',
            'apellido.regex' => 'El apellido solo puede contener letras',
            'telefono.required' => 'El teléfono es obligatorio',
            'telefono.min' => 'El teléfono debe tener al menos 8 dígitos',
            'telefono.regex' => 'El teléfono solo puede contener números, espacios y guiones',
            'ciudad.required' => 'La ciudad es obligatoria',
            'provincia.required' => 'La provincia es obligatoria',
            'fecha_nac.required' => 'La fecha de nacimiento es obligatoria',
            'fecha_nac.before' => 'La fecha de nacimiento no puede ser futura',
            'fecha_nac.after' => 'La fecha de nacimiento no es válida',
            'biografia.max' => 'La biografía no puede exceder 500 caracteres',
            'interests.required' => 'Debes seleccionar al menos un interés',
            'interests.min' => 'Debes seleccionar al menos un interés',
            'tipo_institucion.required' => 'El tipo de institución es obligatorio',
            'tipo_institucion.min' => 'El tipo de institución debe tener al menos 3 caracteres',
            'tipo_institucion_otro.required_if' => 'Debe especificar el tipo de institución',
            'tipo_institucion_otro.min' => 'El tipo de institución debe tener al menos 3 caracteres',
            'direccion.required' => 'La dirección es obligatoria',
            'direccion.min' => 'La dirección debe tener al menos 5 caracteres',
            'latitud.required' => 'Debes validar la dirección primero',
            'longitud.required' => 'Debes validar la dirección primero',
            'url_sitio_web.url' => 'Ingresa una URL válida',
            'url_sitio_web.regex' => 'La URL debe comenzar con http:// o https://',
            'descripcion.max' => 'La descripción no puede exceder 1000 caracteres',
            'ano_fundacion.integer' => 'El año de fundación debe ser un número',
            'ano_fundacion.min' => 'El año de fundación no puede ser anterior a 1800',
            'ano_fundacion.max' => 'El año de fundación no puede ser futuro',
            'doc_identificador.required' => 'El documento identificador es obligatorio',
            'tipo_documento.required' => 'El tipo de documento es obligatorio',
            'tipo_documento.in' => 'El tipo de documento no es válido',
            'profile_photo_path.image' => 'El archivo debe ser una imagen',
            'profile_photo_path.mimes' => 'Solo se permiten imágenes JPG, PNG o WEBP',
            'profile_photo_path.max' => 'La imagen no puede superar los 2MB',
        ]);

        // Validación adicional del documento si es institución
        if ($tipoUsuario === 'institucion') {
            if (!$this->validateDocumento($validated['tipo_documento'], $validated['doc_identificador'])) {
                return back()->withErrors([
                    'doc_identificador' => $validated['tipo_documento'] === 'DNI'
                        ? 'El DNI debe tener 7 u 8 dígitos'
                        : 'El ' . $validated['tipo_documento'] . ' debe tener 11 dígitos'
                ])->withInput();
            }
        }

        // Actualizar datos básicos
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Usuario no autenticado.');
        }

        $userData = [
            'nombre' => $validated['nombre'],
            'telefono' => $validated['telefono'],
            'ciudad' => $validated['ciudad'],
            'provincia' => $validated['provincia'],
        ];

        $user->update($userData);

        // guardar foto
        if ($request->hasFile('profile_photo_path')) {
            $path = $request->file('profile_photo_path')->store('profile-photos', 'public');
            $user->update(['profile_photo_path' => $path]);
        } elseif (!$user->profile_photo_path) {
            $user->update(['profile_photo_path' => 'profile-photos/default-avatar.webp']);
        }

        // Crear perfil según tipo
        if ($tipoUsuario === 'persona') {
            PerfPersona::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'apellido' => $validated['apellido'],
                    'fecha_nac' => $validated['fecha_nac'],
                    'interests' => $validated['interests'],
                    'biografia' => $validated['biografia'] ?? null,
                ]
            );

            $user->update(['estado' => 'activo']);

            return redirect()->route('inicio')
                ->with('success', 'Perfil completado correctamente.');
        } else {
            $approvalToken = \Illuminate\Support\Str::random(64);

            // Limpiar documento antes de guardar
            $documentoLimpio = preg_replace('/[^0-9]/', '', $validated['doc_identificador']);

            // Construir dirección completa
            $direccionCompleta = "{$validated['direccion']}, {$validated['ciudad']}, {$validated['provincia']}";

            // Determinar el tipo de institución final
            $tipoInstitucionFinal = $validated['tipo_institucion'];
            if ($tipoInstitucionFinal === 'Otro' && !empty($validated['tipo_institucion_otro'])) {
                $tipoInstitucionFinal = $validated['tipo_institucion_otro'];
            }

            $institucion = PerfInstitucion::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'tipo_institucion' => $tipoInstitucionFinal,
                    'direccion' => $direccionCompleta,
                    'ciudad' => $validated['ciudad'],
                    'provincia' => $validated['provincia'],
                    'latitud' => $validated['latitud'],
                    'longitud' => $validated['longitud'],
                    'url_sitio_web' => $validated['url_sitio_web'] ?? null,
                    'descripcion' => $validated['descripcion'] ?? null,
                    'ano_fundacion' => $validated['ano_fundacion'] ?? null,
                    'interests' => $validated['interests'],
                    'doc_identificador' => $documentoLimpio,
                    'tipo_documento' => $validated['tipo_documento'],
                    'verificado' => 0,
                    'approval_token' => $approvalToken,
                ]
            );

            $user->update(['estado' => 'pendiente_aprobacion']);

            $tokenFinal = $institucion->approval_token;

            $user->load('institucion');

            // Generar URLs públicas para el email
            $urlAprobar = url("/institucion/aprobar/{$tokenFinal}");
            $urlRechazar = url("/institucion/rechazar/{$tokenFinal}");

            // Enviar email al administrador
            try {
                Mail::to(env('MAIL_ADMIN_ADDRESS'))->send(
                    new \App\Mail\NuevaInstitucionRegistrada($user, $urlAprobar, $urlRechazar)
                );
            } catch (\Exception $e) {
                Log::error('Error enviando email al admin: ' . $e->getMessage());
            }

            return redirect()->route('institucion.pendiente')
                ->with('info', 'Perfil completado. Tu institución será revisada por el administrador.');
        }
    }

    public function updateInstitucion(Request $request)
{
    $user = $request->user();

    // Asegurar que el usuario sea de tipo institución
    if ($user->tipo_usuario !== 'institucion') {
        return back()->withErrors(['general' => 'Solo las instituciones pueden modificar estos datos.']);
    }

    $validated = $request->validate([
        'tipo_institucion' => 'required|string|min:3|max:100',
        'direccion' => 'required|string|min:5|max:255',
        'ciudad' => 'required|string|min:2|max:100',
        'latitud' => 'required|numeric|between:-90,90',
        'longitud' => 'required|numeric|between:-180,180',
        'url_sitio_web' => 'nullable|url|max:255|regex:/^https?:\/\/.+\..+/',
        'descripcion' => 'nullable|string|max:1000',
        'ano_fundacion' => 'nullable|integer|min:1800|max:' . date('Y'),
    ], [
        'tipo_institucion.required' => 'El tipo de institución es obligatorio.',
        'direccion.required' => 'La dirección es obligatoria.',
        'ciudad.required' => 'La ciudad es obligatoria.',
        'latitud.required' => 'Debes validar la dirección primero.',
        'longitud.required' => 'Debes validar la dirección primero.',
        'latitud.between' => 'Las coordenadas de latitud no son válidas.',
        'longitud.between' => 'Las coordenadas de longitud no son válidas.',
        'url_sitio_web.url' => 'Ingresá una URL válida.',
        'url_sitio_web.regex' => 'La URL debe comenzar con http:// o https://.',
        'descripcion.max' => 'La descripción no puede exceder 1000 caracteres.',
        'ano_fundacion.integer' => 'El año de fundación debe ser un número.',
        'ano_fundacion.min' => 'El año de fundación no puede ser anterior a 1800.',
        'ano_fundacion.max' => 'El año de fundación no puede ser futuro.',
    ]);

    // Buscar el perfil existente
    $institucion = PerfInstitucion::where('user_id', $user->id)->firstOrFail();

    // Actualizar todos los campos
    $institucion->update([
        'tipo_institucion' => $validated['tipo_institucion'],
        'direccion' => $validated['direccion'],
        'ciudad' => $validated['ciudad'],
        'latitud' => $validated['latitud'],
        'longitud' => $validated['longitud'],
        'url_sitio_web' => $request->filled('url_sitio_web') ? $validated['url_sitio_web'] : null,

        'descripcion' => $request->filled('descripcion') ? $validated['descripcion'] : null,

        'ano_fundacion' => $request->filled('ano_fundacion') ? $validated['ano_fundacion'] : null,

    ]);

    // También actualizar la ciudad en la tabla users
    $user->update([
        'ciudad' => $validated['ciudad'],
    ]);

    return back()->with('status', 'Perfil institucional actualizado correctamente.');
}

    public function updatePersona(Request $request)
    {
        $user = $request->user();

        // Asegurar que el usuario sea de tipo persona
        if ($user->tipo_usuario !== 'persona') {
            return back()->withErrors(['general' => 'Solo las personas pueden modificar estos datos.']);
        }

        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$/'
            ],
            'apellido' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/'
            ],
            'biografia' => 'nullable|string|max:500',
        ], [
            'apellido.required' => 'El apellido es obligatorio.',
            'apellido.min' => 'El apellido debe tener al menos 2 caracteres.',
            'apellido.regex' => 'El apellido solo puede contener letras.',
            'biografia.max' => 'La biografía no puede exceder 500 caracteres.',
        ]);

        $user->update([
            'nombre' => $validated['nombre'],
        ]);

        // Buscar el perfil existente
        $persona = PerfPersona::where('user_id', $user->id)->firstOrFail();

        $persona->update([
            'apellido' => $validated['apellido'],
            'biografia' => $validated['biografia'] ?? null,
        ]);

        return back()->with('status', 'Perfil personal actualizado correctamente.');
    }


    /**
     * Ver publicaciones a las que le dio like el usuario
     */
    public function likes(Request $request)
    {
        $user = $request->user();

        // Obtener el perfil según el tipo de usuario
        if ($user->tipo_usuario === 'persona') {
            $perfId = $user->persona->id;
            $perfKey = 'perf_persona_id';
        } else {
            $perfId = $user->institucion->id;
            $perfKey = 'perf_institucion_id';
        }

        // Obtener los IDs de publicaciones con like
        $likedIds = Like::where($perfKey, $perfId)
            ->where('target_tipo', 'publicacion')
            ->pluck('target_id');

        // Obtener las publicaciones completas
        $likedPublicaciones = Publicacion::whereIn('id', $likedIds)
            ->with([
                'institucion.user',
                'media',
                'likes',
                'comentarios',
                'favoritos'
            ])
            ->withCount(['likes', 'comentarios'])
            ->latest()
            ->get()
            ->map(function ($publicacion) use ($user, $perfKey, $perfId) {
                // Agregar información de si el usuario actual dio like
                $publicacion->user_has_liked = true; // Sabemos que dio like

                // Agregar información de favorito (solo para personas)
                if ($user->tipo_usuario === 'persona') {
                    $publicacion->is_favorite = $publicacion->favoritos->contains('perf_persona_id', $perfId);
                } else {
                    $publicacion->is_favorite = false;
                }

                return $publicacion;
            });

        return Inertia::render('Profile/Likes', [
            'auth' => [
                'user' => $user,
            ],
            'likedPublicaciones' => $likedPublicaciones,
        ]);
    }
}
