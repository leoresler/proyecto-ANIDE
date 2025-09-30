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
     * Completar el perfil del usuario según su tipo (persona o institución)
     */
    public function completarPerfil(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $rulesComunes = [
            'nombre' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'ciudad' => 'required|string|max:100',
            'provincia' => 'required|string|max:100',
            'profile_photo_path' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'interests' => 'nullable|array',
            'interests.*' => 'string|max:255',
        ];

        if ($user->tipo_usuario === 'persona') {
            $rulesEspecificas = [
                'apellido' => 'required|string|max:255',
                'fecha_nac' => 'nullable|date|before:today',
                'biografia' => 'nullable|string|max:1000',
            ];
        } else {
            $rulesEspecificas = [
                'tipo_institucion' => 'required|string|max:255',
                'direccion' => 'nullable|string|max:255',
                'url_sitio_web' => 'nullable|url|max:255',
                'descripcion' => 'nullable|string|max:1000',
                'latitud' => 'nullable|numeric|between:-90,90',
                'longitud' => 'nullable|numeric|between:-180,180',
                'ano_fundacion' => 'nullable|integer|min:1800|max:' . date('Y'),
            ];
        }

        $validated = $request->validate(array_merge($rulesComunes, $rulesEspecificas));

        // 📌 Guardar foto en users.profile_photo_path
        if ($request->hasFile('profile_photo_path')) {
            $path = $request->file('profile_photo_path')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        // 📌 Guardar datos comunes en users
        $user->nombre = $validated['nombre'];
        $user->telefono = $validated['telefono'];
        $user->ciudad = $validated['ciudad'];
        $user->provincia = $validated['provincia'];
        $user->interests = $validated['interests'] ?? [];
        $user->save();

        // 📌 Guardar perfil específico
        if ($user->tipo_usuario === 'persona') {
            PerfPersona::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'apellido' => $validated['apellido'],
                    'fecha_nac' => $validated['fecha_nac'] ?? null,
                    'biografia' => $validated['biografia'] ?? null,
                ]
            );
        } else {
            PerfInstitucion::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'tipo_institucion' => $validated['tipo_institucion'],
                    'direccion' => $validated['direccion'] ?? null,
                    'url_sitio_web' => $validated['url_sitio_web'] ?? null,
                    'descripcion' => $validated['descripcion'] ?? null,
                    'latitud' => $validated['latitud'] ?? null,
                    'longitud' => $validated['longitud'] ?? null,
                    'ano_fundacion' => $validated['ano_fundacion'] ?? null,
                    'cantidad_seguidores' => 0,
                    'verificado' => false,
                ]
            );
        }

        return redirect()->route('inicio')->with('success', '¡Perfil completado exitosamente!');
    }

}
