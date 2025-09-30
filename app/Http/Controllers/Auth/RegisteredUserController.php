<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {

        $request->validate([
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'tipo_usuario' => 'required|in:persona,institucion'
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),

            // campos en comun
            'nombre' => 'null',
            'telefono' => 'null',
            'ciudad' => 'null',
            'provincia' => 'null',

            'tipo_usuario' => $request->tipo_usuario ?? 'persona',
            'estado' => 'pendiente_verif',
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('completar.datos', ['type' => $user->tipo_usuario]);
        // return redirect()->route('inicio');
    }
}
