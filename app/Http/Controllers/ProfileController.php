<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\PerfPersona;
use App\Models\PerfInstitucion;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Events\Registered;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\NuevaInstitucionRegistrada;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'auth' => [
                'user' => $request->user(),
            ],
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

        if ($user->profile_photo_path && $user->profile_photo_path !== 'profile-photos/default.png') {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $user->profile_photo_path = null;
        $user->save();

        return Inertia::location(route('profile.edit'));
    }

    public function updateInterests(Request $request)
    {
        $request->validate([
            'interests' => 'array',
            'interests.*' => 'string|max:255',
        ]);

        $user = $request->user();

        // Si el usuario es tipo persona
        if ($user->tipo_usuario === 'persona') {
            $perfil = PerfPersona::firstOrCreate(['user_id' => $user->id]);
            $perfil->interests = $request->interests ?? [];
            $perfil->save();
        }

        return redirect()->route('profile.edit')->with('success', 'Intereses actualizados.');
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
            'profile_photo_path' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048',
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
            'ciudad' => 'required|string|min:2|max:100',
            'provincia' => 'required|string|min:2|max:100',
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
            $rules['interests'] = 'required|array|min:1';
            $rules['interests.*'] = 'string|max:255';
        } else {
            $rules['tipo_institucion'] = 'required|string|min:3|max:100';
            $rules['direccion'] = 'required|string|min:5|max:255';
            $rules['url_sitio_web'] = 'nullable|url|max:255|regex:/^https?:\/\/.+\..+/';
            $rules['descripcion'] = 'nullable|string|max:1000';
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
            'direccion.required' => 'La dirección es obligatoria',
            'direccion.min' => 'La dirección debe tener al menos 5 caracteres',
            'url_sitio_web.url' => 'Ingresa una URL válida',
            'url_sitio_web.regex' => 'La URL debe comenzar con http:// o https://',
            'descripcion.max' => 'La descripción no puede exceder 1000 caracteres',
            'doc_identificador.required' => 'El documento identificador es obligatorio',
            'tipo_documento.required' => 'El tipo de documento es obligatorio',
            'tipo_documento.in' => 'El tipo de documento no es válido',
            'profile_photo_path.image' => 'El archivo debe ser una imagen',
            'profile_photo_path.mimes' => 'Solo se permiten imágenes JPG, PNG o GIF',
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

        $user->update([
            'nombre' => $validated['nombre'],
            'telefono' => $validated['telefono'],
            'ciudad' => $validated['ciudad'],
            'provincia' => $validated['provincia'],
        ]);

        // Guardar foto
        if ($request->hasFile('profile_photo_path')) {
            $path = $request->file('profile_photo_path')->store('profile-photos', 'public');
            $user->update(['profile_photo_path' => $path]);
        }

        // Crear perfil según tipo
        if ($tipoUsuario === 'persona') {
            PerfPersona::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'apellido' => $validated['apellido'],
                    'fecha_nac' => $validated['fecha_nac'],
                    'interests' => $validated['interests'] ?? [],
                    'biografia' => $validated['biografia'] ?? null,
                ]
            );

            $user->update(['estado' => 'activo']);

            return redirect()->route('inicio')
                ->with('success', 'Perfil completado correctamente.');
        } else {
            $approvalToken = bin2hex(random_bytes(20));

            // Limpiar documento antes de guardar
            $documentoLimpio = preg_replace('/[^0-9]/', '', $validated['doc_identificador']);

            PerfInstitucion::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'tipo_institucion' => $validated['tipo_institucion'],
                    'direccion' => $validated['direccion'],
                    'url_sitio_web' => $validated['url_sitio_web'] ?? null,
                    'descripcion' => $validated['descripcion'] ?? null,
                    'doc_identificador' => $documentoLimpio,
                    'tipo_documento' => $validated['tipo_documento'],
                    'verificado' => 0,
                    'approval_token' => \Illuminate\Support\Str::random(64),
                ]
            );

            $user->update(['estado' => 'pendiente_aprobacion']);

            // Generar URLs públicas para el email
            $urlAprobar = url("/institucion/aprobar/{$approvalToken}");
            $urlRechazar = url("/institucion/rechazar/{$approvalToken}");

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
}
