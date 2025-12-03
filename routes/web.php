<?php

use App\Http\Controllers\ActividadController;
use App\Http\Controllers\MapaController;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\InstitucionAprobacionController;
use App\Http\Controllers\ResidenciaController;

use App\Http\Controllers\Publicaciones\PublicacionController;
use App\Http\Controllers\Publicaciones\LikeController;
use App\Http\Controllers\Publicaciones\FavoritoController;
use App\Http\Controllers\Publicaciones\ComentarioController;
use App\Http\Controllers\Chats\ChatController;
use App\Http\Controllers\InstitucionController;
use App\Http\Controllers\InstitucionMaterialController;
use App\Http\Controllers\BusquedaController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\UbicacionController;
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


// busqueda API
Route::get('/api/buscar', [BusquedaController::class, 'buscarApi'])
    ->middleware(['auth'])
    ->withoutMiddleware([\App\Http\Middleware\EnsureProfileIsComplete::class])
    ->name('busqueda.api');

// material (cursos y carreras) - solo para instituciones
Route::middleware(['check.institucion'])->group(function () {
    Route::get('/mis-materiales', [InstitucionMaterialController::class, 'index'])
        ->name('material.index');
    Route::get('/material/create', [InstitucionMaterialController::class, 'create'])
        ->name('material.create');
    Route::post('/material', [InstitucionMaterialController::class, 'store'])
        ->name('material.store');
    Route::get('/material/{id}/edit', [InstitucionMaterialController::class, 'edit'])
        ->name('material.edit');
    Route::put('/material/{id}', [InstitucionMaterialController::class, 'update'])
        ->name('material.update');
    Route::delete('/material/{id}', [InstitucionMaterialController::class, 'destroy'])
        ->name('material.destroy');
});


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

    // actualizar perfil persona
    Route::patch('/profile/persona', [ProfileController::class, 'updatePersona'])
        ->middleware(['auth'])
        ->name('profile.persona.update');

    // actualizar perfil institucion
    Route::patch('/profile/institucion', [ProfileController::class, 'updateInstitucion'])
        ->middleware(['auth'])
        ->name('profile.institucion.update');

    // feed principal (inicio)
    Route::get('/inicio', [PublicacionController::class, 'index'])->name('inicio');

    // rutas solo para instituciones
    Route::middleware(['check.institucion'])->group(function () {
        Route::get('/publicaciones/create', [PublicacionController::class, 'create'])
            ->name('publicaciones.create');
        Route::get('/publicaciones/misPublicaciones', [PublicacionController::class, 'misPublicaciones'])
            ->name('publicaciones.misPublicaciones');
        Route::post('/publicaciones', [PublicacionController::class, 'store'])
            ->name('publicaciones.store');
        Route::get('/publicaciones/{id}/edit', [PublicacionController::class, 'edit'])
            ->name('publicaciones.edit');
        Route::post('/publicaciones/{id}', [PublicacionController::class, 'update'])
            ->name('publicaciones.update');
        Route::delete('/publicaciones/{id}', [PublicacionController::class, 'destroy'])
            ->name('publicaciones.destroy');
    });

    // ver perf instituciones
    Route::get('/instituciones/{id}', [InstitucionController::class, 'show'])->name('instituciones.show');

    // publicaciones
    Route::get('/publicaciones/{id}', [PublicacionController::class, 'show'])->name('publicaciones.show');

    // likes
    Route::post('/likes/toggle', [LikeController::class, 'toggle'])->name('likes.toggle');
    Route::get('/likes', [ProfileController::class, 'likes'])->name('profile.likes');

    // comentarios
    Route::post('/comentarios', [ComentarioController::class, 'store'])->name('comentarios.store');
    Route::delete('/comentarios/{id}', [ComentarioController::class, 'destroy'])
        ->name('comentarios.destroy');

    // favoritos
    Route::post('/favoritos/toggle', [FavoritoController::class, 'toggle'])->name('favoritos.toggle');
    Route::get('/favoritos', [FavoritoController::class, 'index'])->name('favoritos.index');

    // mi Actividad
    Route::get('/mi-actividad', [ActividadController::class, 'index'])->name('actividad.index');

    // mapa
    Route::get('/chats', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chats/{id}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/chats/iniciar', [ChatController::class, 'iniciarChat'])->name('chat.iniciar');
    Route::post('/chats/{id}/mensaje', [ChatController::class, 'enviarMensaje'])->name('chat.enviar');

    // residencias
    Route::resource('residencias', ResidenciaController::class);

    // API de recomendaciones (disponible para todos los usuarios autenticados)
    Route::get('/api/recomendaciones', [InstitucionMaterialController::class, 'recomendaciones'])
        ->name('api.recomendaciones');

    // mapa
    Route::get('/mapa', [MapaController::class, 'index'])->name('mapa.index');
    Route::post('/mapa/filtrar', [MapaController::class, 'filtrar'])->name('mapa.filtrar');

    // pagina de busqueda
    Route::get('/busqueda', [BusquedaController::class, 'index'])->name('busqueda.index');

    // cursos y carreras (material para usuarios autenticados)
    Route::get('/material', [InstitucionMaterialController::class, 'listar'])
    ->name('material.listar');

    Route::get('/material/{id}', [InstitucionMaterialController::class, 'show'])
        ->name('material.show');
    
    Route::post('/material/{id}/toggle-guardado', [InstitucionMaterialController::class, 'toggleGuardado'])
        ->name('material.toggle.guardado');
    
    Route::get('/mis-cursos', [InstitucionMaterialController::class, 'misCursos'])
        ->name('cursos.guardados');
    
    Route::get('/mis-carreras', [InstitucionMaterialController::class, 'misCarreras'])
        ->name('carreras.guardadas');


    // ver modal persona
    Route::get('/personas/{id}', function ($id) {
        $persona = \App\Models\PerfPersona::with('user')
            ->where('id', $id)
            ->first();

        if (!$persona) {
            return response()->json(['error' => 'Persona no encontrada'], 404);
        }

        return response()->json([
            'id' => $persona->id,
            'apellido' => $persona->apellido,
            'fecha_nac' => $persona->fecha_nac,
            'interests' => $persona->interests,
            'biografia' => $persona->biografia,
            'user' => [
                'nombre' => $persona->user->nombre,
                'ciudad' => $persona->user->ciudad,
                'provincia' => $persona->user->provincia,
                'profile_photo_url' => $persona->user->profile_photo_url,
            ]
        ]);
    });
});


Route::get('/institucion/pendiente', function () {
    return Inertia::render('InstitucionPendiente');
})->name('institucion.pendiente');

// chat
Route::get('/chat', function () {
    return Inertia::render('Chat/ChatPage');
})
    ->middleware('auth')
    ->name('chat');

// rutas publicas para ver mapa
Route::get('/api/residencias/map/all', [ResidenciaController::class, 'getAllForMap'])
    ->name('residencias.map.all');

Route::get('/api/residencias/institucion/{institucionId}', [ResidenciaController::class, 'getByInstitucion'])
    ->name('residencias.by.institucion');



Route::post('/chats/{chatId}/escribiendo', [ChatController::class, 'escribiendo'])
    ->middleware('auth');


Route::put('/profile/interests', [ProfileController::class, 'updateInterests'])
    ->middleware('auth')
    ->name('profile.interests.update');


Route::post('/chats/{chat}/marcar-leidos', [ChatController::class, 'marcarLeidos'])
->middleware('auth');

Route::post('/chats/{chat}/archivar', [ChatController::class, 'archivar'])
    ->middleware('auth')
     ->name('chat.archivar');

Route::post('/chats/{chat}/recibir', [\App\Http\Controllers\Chats\ChatController::class, 'recibir'])
    ->middleware('auth')
    ->name('chat.recibir');

Route::get('/api/chat/{id}', [ChatController::class, 'apiShow'])
    ->middleware('auth')
    ->name('chat.api.show');

Route::get('/api/chats', [ChatController::class, 'apiIndex'])
    ->middleware('auth')
    ->name('chat.api.index');
    
Route::get('/chats', [ChatController::class, 'index'])
->middleware('auth') ->name('chat.index');

Route::post('/notificaciones/marcar-leidas', [NotificacionController::class, 'marcarLeidas'])
    ->name('notificaciones.marcar-leidas')
    ->middleware('auth');

    //ubicaciones guardadas
    Route::post('/ubicaciones/toggle', [UbicacionController::class, 'toggle'])
    ->middleware(['auth'])
    ->name('ubicaciones.toggle');

    Route::get('/ubicaciones', [UbicacionController::class, 'index'])
        ->middleware(['auth'])
        ->name('ubicaciones.index');

    // Route::get('/ubicaciones', [UbicacionController::class, 'index'])->name('ubicaciones.show');

    // Route::post('/api/ubicaciones/toggle', [UbicacionController::class, 'toggleApi']);



require __DIR__ . '/auth.php';
