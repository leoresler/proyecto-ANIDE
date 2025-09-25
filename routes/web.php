<?php

use App\Http\Controllers\ComunidadController;
use App\Http\Controllers\MapaController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\VideosController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/inicio', function () {
    return Inertia::render('Inicio');
})->middleware(['auth', 'verified'])->name('inicio');

Route::middleware('auth')->group(function () {
    // perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // comunidad
    Route::get('/comunidad', [ComunidadController::class, 'index'])->name('comunidad.index');

    // mapa
    Route::get('/mapa', [MapaController::class, 'index'])->name('mapa.index');

    // usuarios
    Route::get('/usuarios', [UsuariosController::class, 'index'])->name('usuarios.index');

    // videos
    Route::get('/videos', [VideosController::class, 'index'])->name('videos.index');
});

require __DIR__.'/auth.php';
