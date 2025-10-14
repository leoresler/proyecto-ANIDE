<?php

use App\Http\Controllers\ComunidadController;
use App\Http\Controllers\MapaController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\VideosController;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\InstitucionAprobacionController;

use App\Http\Controllers\Publicaciones\PublicacionController;
use App\Http\Controllers\Publicaciones\LikeController;
use App\Http\Controllers\Publicaciones\FavoritoController;
use App\Http\Controllers\Publicaciones\ComentarioController;
use App\Http\Controllers\Chats\ChatController;

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


// // inicio - requiere autenticacion, verificacion y completar datos
// Route::get('/inicio', function () {
//     return Inertia::render('Inicio');
// })->middleware(['auth', 'verified'])->name('inicio');


// rutas protegidas - requieren autenticacion, verificacion y completar datos
Route::middleware(['auth', 'verified'])->group(function () {
    // perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo');
    Route::delete('/profile/photo', [ProfileController::class, 'destroyPhoto'])->name('profile.photo.destroy');
    Route::post('/profile/interests', [ProfileController::class, 'updateInterests'])->name('profile.interests.update');

    // Feed principal (inicio)
    Route::get('/inicio', [PublicacionController::class, 'index'])->name('inicio');

    // Rutas solo para instituciones
    Route::middleware(['check.institucion'])->group(function () {
        Route::get('/publicaciones/create', [PublicacionController::class, 'create'])
            ->name('publicaciones.create');
        Route::get('/publicaciones/misPublicaciones', [PublicacionController::class, 'misPublicaciones'])
            ->name('publicaciones.misPublicaciones');
        Route::post('/publicaciones', [PublicacionController::class, 'store'])
            ->name('publicaciones.store');
        Route::delete('/publicaciones/{id}', [PublicacionController::class, 'destroy'])
            ->name('publicaciones.destroy');
    });

    // Publicaciones
    Route::get('/publicaciones/{id}', [PublicacionController::class, 'show'])->name('publicaciones.show');

    // Likes (tanto personas como instituciones)
    Route::post('/likes/toggle', [LikeController::class, 'toggle'])->name('likes.toggle');

    // Comentarios (tanto personas como instituciones)
    Route::post('/comentarios', [ComentarioController::class, 'store'])->name('comentarios.store');
    Route::delete('/comentarios/{id}', [ComentarioController::class, 'destroy'])
        ->name('comentarios.destroy');


    // Favoritos (solo personas)
    Route::middleware(['check.persona'])->group(function () {
        Route::post('/favoritos/toggle', [FavoritoController::class, 'toggle'])->name('favoritos.toggle');
        Route::get('/favoritos', [FavoritoController::class, 'index'])->name('favoritos.index');
    });


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

// chat
Route::get('/chat', function () {
    return Inertia::render('Chat/ChatPage');
})->name('chat');



Route::middleware(['auth'])->group(function () {
    Route::get('/chats', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chats/{id}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chats/iniciar', [ChatController::class, 'iniciarChat'])->name('chat.iniciar');
    Route::post('/chats/{id}/mensaje', [ChatController::class, 'enviarMensaje'])->name('chat.enviar');
});



require __DIR__ . '/auth.php';
