<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
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

    return back()->with('success', 'Foto de perfil eliminada.');
    }


}
