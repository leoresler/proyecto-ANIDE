<?php

use App\Http\Controllers\Auth\InstitucionAprobacionController;
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
})->name('welcome');


// aprobar/rechazar institucion
Route::get('/institucion/aprobar/{token}', [InstitucionAprobacionController::class, 'aprobar'])
    ->name('institucion.aprobar')
    ->withoutMiddleware([\App\Http\Middleware\EnsureProfileIsComplete::class]);

Route::get('/institucion/rechazar/{token}', [InstitucionAprobacionController::class, 'rechazar'])
    ->name('institucion.rechazar')
    ->withoutMiddleware([\App\Http\Middleware\EnsureProfileIsComplete::class]);


// completar datos del usuario
Route::get('/completar-datos/{type}', function ($type) {
    return Inertia::render('CompletarDatosUser', [
        'type' => $type
    ]);
})->name('completar.datos');

Route::post('/completar-datos', [ProfileController::class, 'completarPerfil'])
    ->name('completar.datos.store');


// inicio - requiere autenticacion Y perfil completo
Route::get('/inicio', function () {
    return Inertia::render('Inicio');
})->middleware(['auth', 'verified'])->name('inicio');


// rutas protegidas - requieren autenticacion Y perfil completo
Route::middleware(['auth', 'verified'])->group(function () {
    // perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo');
    Route::delete('/profile/photo', [ProfileController::class, 'destroyPhoto'])->name('profile.photo.destroy');
    Route::post('/profile/interests', [ProfileController::class, 'updateInterests'])->name('profile.interests.update');

    // comunidad
    Route::get('/comunidad', [ComunidadController::class, 'index'])->name('comunidad.index');

    // mapa
    Route::get('/mapa', [MapaController::class, 'index'])->name('mapa.index');

    // usuarios
    Route::get('/usuarios', [UsuariosController::class, 'index'])->name('usuarios.index');

    // videos
    Route::get('/videos', [VideosController::class, 'index'])->name('videos.index');
});


Route::get('/institucion/pendiente', function () {
        return Inertia::render('InstitucionPendiente');
    })->name('institucion.pendiente');






require __DIR__ . '/auth.php';
