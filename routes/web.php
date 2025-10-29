<?php

use App\Models\Publicacion;
use App\Models\PerfInstitucion;

use App\Http\Controllers\MapaController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\VideosController;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\InstitucionAprobacionController;
use App\Http\Controllers\ResidenciaController;

use App\Http\Controllers\Publicaciones\PublicacionController;
use App\Http\Controllers\Publicaciones\LikeController;
use App\Http\Controllers\Publicaciones\FavoritoController;
use App\Http\Controllers\Publicaciones\ComentarioController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
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
        Route::get('/publicaciones/{id}/edit', [PublicacionController::class, 'edit'])
            ->name('publicaciones.edit');
        Route::post('/publicaciones/{id}', [PublicacionController::class, 'update'])
            ->name('publicaciones.update');
        Route::delete('/publicaciones/{id}', [PublicacionController::class, 'destroy'])
            ->name('publicaciones.destroy');
    });

    // publicaciones
    Route::get('/publicaciones/{id}', [PublicacionController::class, 'show'])->name('publicaciones.show');

    // likes
    Route::post('/likes/toggle', [LikeController::class, 'toggle'])->name('likes.toggle');

    // comentarios
    Route::post('/comentarios', [ComentarioController::class, 'store'])->name('comentarios.store');
    Route::delete('/comentarios/{id}', [ComentarioController::class, 'destroy'])
        ->name('comentarios.destroy');

    Route::post('/favoritos/toggle', [FavoritoController::class, 'toggle'])->name('favoritos.toggle');
    Route::get('/favoritos', [FavoritoController::class, 'index'])->name('favoritos.index');

    // residencias
    Route::resource('residencias', ResidenciaController::class);

    // mapa
    Route::get('/mapa', [MapaController::class, 'index'])->name('mapa.index');
    Route::post('/mapa/filtrar', [MapaController::class, 'filtrar'])->name('mapa.filtrar');


    // usuarios
    Route::get('/usuarios', [UsuariosController::class, 'index'])->name('usuarios.index');

    // videos
    Route::get('/videos', [VideosController::class, 'index'])->name('videos.index');

    // busqueda en web para no crear controlador
    Route::get('/api/buscar', function () {
        $query = request()->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'publicaciones' => [],
                'instituciones' => []
            ]);
        }

        // Buscar publicaciones
        $publicaciones = Publicacion::query()
            ->where(function ($q) use ($query) {
                $q->where('titulo', 'LIKE', "%{$query}%")
                    ->orWhere('contenido', 'LIKE', "%{$query}%");
            })
            ->where('publicado', true)
            ->with(['institucion.user'])
            ->select('id', 'titulo', 'contenido', 'perf_institucion_id', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();

        // Buscar instituciones
        $instituciones = PerfInstitucion::query()
            ->whereHas('user', function ($q) use ($query) {
                $q->where('nombre', 'LIKE', "%{$query}%")
                    ->where('tipo_usuario', 'institucion')
                    ->where('estado', 'activo');
            })
            ->where('verificado', true)
            ->with('user:id,nombre,email,telefono,ciudad,provincia')
            ->select('id', 'user_id', 'descripcion', 'foto_perfil', 'tipo_institucion', 'direccion')
            ->limit(15)
            ->get()
            ->map(function ($institucion) {
                return [
                    'id' => $institucion->id,
                    'user_id' => $institucion->user_id,
                    'nombre' => $institucion->user->nombre ?? 'Sin nombre',
                    'descripcion' => $institucion->descripcion,
                    'foto_perfil' => $institucion->foto_perfil,
                    'tipo_institucion' => $institucion->tipo_institucion,
                    'direccion' => $institucion->direccion,
                    'ciudad' => $institucion->user->ciudad ?? null,
                    'provincia' => $institucion->user->provincia ?? null,
                ];
            });

        return response()->json([
            'publicaciones' => $publicaciones,
            'instituciones' => $instituciones
        ]);
    })->name('busqueda.api');

    Route::get('/busqueda', function () {
        $query = request()->input('q', '');

        $publicaciones = [];
        $instituciones = [];

        if (strlen($query) >= 2) {
            $publicaciones = Publicacion::query()
                ->where(function ($q) use ($query) {
                    $q->where('titulo', 'LIKE', "%{$query}%")
                        ->orWhere('contenido', 'LIKE', "%{$query}%");
                })
                ->where('publicado', true)
                ->with(['institucion.user', 'media', 'likes', 'comentarios', 'favoritos'])
                ->withCount(['likes', 'comentarios'])
                ->latest()
                ->paginate(10)
                ->withQueryString();

            $institucionesQuery = PerfInstitucion::query()
                ->whereHas('user', function ($q) use ($query) {
                    $q->where('nombre', 'LIKE', "%{$query}%")
                        ->where('tipo_usuario', 'institucion')
                        ->where('estado', 'activo');
                })
                ->where('verificado', true)
                ->with('user:id,nombre,email,telefono,ciudad,provincia')
                ->paginate(10)
                ->withQueryString();

            $institucionesQuery->getCollection()->transform(function ($institucion) {
                $institucion->nombre = $institucion->user->nombre ?? 'Sin nombre';
                $institucion->ciudad = $institucion->user->ciudad ?? null;
                $institucion->provincia = $institucion->user->provincia ?? null;
                return $institucion;
            });

            $instituciones = $institucionesQuery;
        }

        return Inertia::render('Busqueda/Index', [
            'query' => $query,
            'publicaciones' => $publicaciones,
            'instituciones' => $instituciones,
            'userType' => Auth::user()
        ]);
    })->name('busqueda.index');
});


Route::get('/institucion/pendiente', function () {
    return Inertia::render('InstitucionPendiente');
})->name('institucion.pendiente');


// rutas publicas para ver mapa
Route::get('/api/residencias/map/all', [ResidenciaController::class, 'getAllForMap'])
    ->name('residencias.map.all');

Route::get('/api/residencias/institucion/{institucionId}', [ResidenciaController::class, 'getByInstitucion'])
    ->name('residencias.by.institucion');




require __DIR__ . '/auth.php';
