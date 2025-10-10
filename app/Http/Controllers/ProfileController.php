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
            'photo' => 'required|image|max:2048', // máximo 2MB
        ]);

        $user = $request->user();

        // Si ya tenía una foto, eliminarla
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        // Guardar la nueva
        $path = $request->file('photo')->store('profile-photos', 'public');

        $user->profile_photo_path = $path;
        $user->save();

        return back()->with('success', 'Foto de perfil actualizada.');
    }

    public function destroyPhoto(Request $request)
    {
        $user = $request->user();

        // Si tiene foto, y no es la default, eliminarla
        if ($user->profile_photo_path && $user->profile_photo_path !== 'profile-photos/default.png') {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        // Asignar la default
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
        $user->interests = $request->interests ?? [];
        $user->save();

        return redirect()->route('profile.edit')->with('success', 'Intereses actualizados.');
    }

    /**
     * Completar los datos del usuario una vez verificado el email.
     */
    public function completarPerfil(Request $request)
    {
        $user = Auth::user();
        $tipoUsuario = $user->tipo_usuario;

        $rules = [
            'profile_photo_path' => 'nullable|image|max:2048',
            'nombre' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'ciudad' => 'required|string|max:100',
            'provincia' => 'required|string|max:100',
        ];

        if ($tipoUsuario === 'persona') {
            $rules['apellido'] = 'required|string|max:255';
            $rules['fecha_nac'] = 'nullable|date|before:today';
            $rules['biografia'] = 'nullable|string|max:500';
            $rules['interests'] = 'nullable|array';
        } else {
            $rules['tipo_institucion'] = 'required|string|max:100';
            $rules['direccion'] = 'required|string|max:255';
            $rules['url_sitio_web'] = 'nullable|url|max:255';
            $rules['descripcion'] = 'nullable|string|max:1000';
            $rules['tipo_documento'] = 'required|in:CUIT,CUIL,DNI';
            $rules['documento_identificador'] = 'required|string|max:20';
        }

        $validated = $request->validate($rules);

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
                    'fecha_nac' => $validated['fecha_nac'] ?? null,
                    'biografia' => $validated['biografia'] ?? null,
                ]
            );

            if (isset($validated['interests'])) {
                $user->update(['interests' => $validated['interests']]);
            }

            $user->update(['estado' => 'activo']);

            return redirect()->route('inicio')
                ->with('success', 'Perfil completado correctamente.');
        } else {
            $approvalToken = bin2hex(random_bytes(20));

            PerfInstitucion::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'tipo_institucion' => $validated['tipo_institucion'],
                    'direccion' => $validated['direccion'],
                    'url_sitio_web' => $validated['url_sitio_web'] ?? null,
                    'descripcion' => $validated['descripcion'] ?? null,
                    'documento_identificador' => $validated['documento_identificador'],
                    'tipo_documento' => $validated['tipo_documento'],
                    'verificado' => 0,
                    'approval_token' => \Illuminate\Support\Str::random(64),
                ]
            );

            // Cambiar estado del usuario a pendiente aprobación
            $user->update(['estado' => 'pendiente_aprobacion']);

            // Generar URLs públicas para el email
            $urlAprobar = url("/instituciones/aprobar/{$approvalToken}");
            $urlRechazar = url("/instituciones/rechazar/{$approvalToken}");

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
