<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Categorías disponibles (basadas en categoriasConfig.js)
     */
    private $categorias = [
        "Tecnologia",
        "Medicina",
        "Derecho",
        "Ingenieria",
        "Arte y Diseño",
        "Deportes",
        "Enfermeria",
        "Psicologia",
        "Educacion",
        "Arquitectura",
        "Administracion",
        "Contabilidad",
        "Marketing",
        "Turismo",
        "Matematicas",
        "Musica",
        "Comunicacion",
        "Informatica",
        "Ciencias Sociales",
        "Idiomas",
    ];

    /**
     * Obtiene un array aleatorio de categorías
     */
    private function getRandomCategorias($min = 1, $max = 5)
    {
        $cantidad = rand($min, min($max, count($this->categorias)));
        $keys = array_rand($this->categorias, $cantidad);
        if (!is_array($keys)) $keys = [$keys];
        return array_map(fn($k) => $this->categorias[$k], $keys);
    }

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Limpiar tablas en orden inverso a las FK
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $tables = [
            'material_guardado',
            'institucion_material',
            'favoritos',
            'likes',
            'coment_publicaciones',
            'publicacion_media',
            'publicaciones',
            'residencias',
            'perf_institucion',
            'perf_persona',
            'users'
        ];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ==================== USUARIOS PERSONAS ====================
        $personasIds = [];
        for ($i = 1; $i <= 15; $i++) {
            $userId = DB::table('users')->insertGetId([
                'email' => "persona{$i}@example.com",
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'nombre' => "Usuario{$i}",
                'telefono' => "299" . rand(1000000, 9999999),
                'ciudad' => ['Neuquén', 'Plottier', 'Centenario', 'Cutral-Có'][rand(0, 3)],
                'provincia' => 'Neuquén',
                'tipo_usuario' => 'persona',
                'estado' => 'activo',
                'profile_photo_path' => rand(0, 1) ? "profile-photos/persona{$i}.jpg" : null,
                'created_at' => now()->subDays(rand(1, 180)),
                'updated_at' => now(),
            ]);

            $personasIds[] = DB::table('perf_persona')->insertGetId([
                'user_id' => $userId,
                'apellido' => "Apellido{$i}",
                'fecha_nac' => now()->subYears(rand(18, 65))->format('Y-m-d'),
                'interests' => json_encode($this->getRandomCategorias(2, 8)),
                'biografia' => "Biografía de Usuario{$i}. Apasionado por el aprendizaje.",
                'created_at' => now()->subDays(rand(1, 180)),
                'updated_at' => now(),
            ]);
        }

        // ==================== USUARIOS INSTITUCIONES ====================
        $institucionesIds = [];
        $nombresInstituciones = [
            'Universidad Nacional del Comahue',
            'Instituto Tecnológico del Neuquén',
            'Centro de Formación Profesional',
            'Academia de Idiomas Global',
            'Escuela de Artes Visuales',
            'Instituto de Capacitación Laboral',
            'Centro Universitario Regional',
            'Fundación Educativa del Sur',
            'Instituto Superior de Música',
            'Centro de Estudios Avanzados'
        ];

        foreach ($nombresInstituciones as $index => $nombre) {
            $i = $index + 1;
            $userId = DB::table('users')->insertGetId([
                'email' => "institucion{$i}@example.com",
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'nombre' => $nombre,
                'telefono' => "299" . rand(4000000, 4999999),
                'ciudad' => ['Neuquén', 'Plottier', 'Centenario'][rand(0, 2)],
                'provincia' => 'Neuquén',
                'tipo_usuario' => 'institucion',
                'estado' => ['activo', 'pendiente_aprobacion'][rand(0, 1)],
                'profile_photo_path' => "logos/institucion{$i}.jpg",
                'created_at' => now()->subDays(rand(1, 365)),
                'updated_at' => now(),
            ]);

            $institucionesIds[] = DB::table('perf_institucion')->insertGetId([
                'user_id' => $userId,
                'doc_identificador' => '30' . rand(10000000, 99999999) . rand(0, 9),
                'tipo_documento' => 'CUIT',
                'tipo_institucion' => ['Universidad', 'Instituto', 'Centro', 'Fundación'][rand(0, 3)],
                'direccion' => "Calle " . ['San Martín', 'Belgrano', 'Rivadavia', 'Mitre'][rand(0, 3)] . " " . rand(100, 9999),
                'url_sitio_web' => "https://institucion{$i}.edu.ar",
                'cantidad_seguidores' => rand(100, 5000),
                'descripcion' => "Descripción de {$nombre}. Institución dedicada a la excelencia educativa.",
                'latitud' => -38.9 + (rand(-100, 100) / 1000),
                'longitud' => -68.0 + (rand(-100, 100) / 1000),
                'verificado' => rand(0, 1),
                'ano_fundacion' => rand(1960, 2020),
                'approval_token' => rand(0, 1) ? Str::uuid() : null,
                'interests' => json_encode($this->getRandomCategorias(3, 8)),
                'created_at' => now()->subDays(rand(1, 365)),
                'updated_at' => now(),
            ]);
        }

        // ==================== RESIDENCIAS ====================
        foreach (array_slice($institucionesIds, 0, 5) as $index => $instId) {
            for ($j = 1; $j <= 2; $j++) {
                DB::table('residencias')->insert([
                    'perf_institucion_id' => $instId,
                    'nombre' => "Residencia {$index}-{$j}",
                    'direccion' => "Av. Argentina " . rand(1000, 5000),
                    'contacto' => "299" . rand(5000000, 5999999),
                    'latitud' => -38.95 + (rand(-50, 50) / 1000),
                    'longitud' => -68.06 + (rand(-50, 50) / 1000),
                    'capacidad' => rand(20, 150),
                    'foto_portada' => "residencias/residencia{$index}-{$j}.jpg",
                    'info_adicional' => "Información adicional sobre la residencia. Incluye servicios básicos.",
                    'created_at' => now()->subDays(rand(1, 200)),
                    'updated_at' => now(),
                ]);
            }
        }

        // ==================== PUBLICACIONES ====================
        $publicacionesIds = [];
        foreach ($institucionesIds as $instId) {
            for ($i = 1; $i <= 3; $i++) {
                $pubId = DB::table('publicaciones')->insertGetId([
                    'perf_institucion_id' => $instId,
                    'titulo' => "Publicación {$i} - Novedades Institucionales",
                    'contenido' => "Contenido de la publicación {$i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Estamos orgullosos de compartir estas novedades con nuestra comunidad.",
                    'categorias' => json_encode($this->getRandomCategorias(1, 5)),
                    'publicado' => rand(0, 10) > 1, // 90% publicado
                    'count_visualizaciones' => rand(10, 5000),
                    'created_at' => now()->subDays(rand(1, 90)),
                    'updated_at' => now(),
                ]);
                $publicacionesIds[] = $pubId;
            }
        }

        // ==================== PUBLICACION MEDIA ====================
        foreach ($publicacionesIds as $pubId) {
            $numMedia = rand(1, 4);
            for ($i = 0; $i < $numMedia; $i++) {
                DB::table('publicacion_media')->insert([
                    'publicacion_id' => $pubId,
                    'tipo' => ['imagen', 'video', 'documento'][rand(0, 2)],
                    'url' => "media/publicacion_{$pubId}_media_{$i}.jpg",
                    'orden' => $i,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ==================== COMENTARIOS ====================
        $comentariosIds = [];
        foreach ($publicacionesIds as $pubId) {
            $numComentarios = rand(2, 8);
            for ($i = 0; $i < $numComentarios; $i++) {
                $esPersona = rand(0, 1);
                $comentarioId = DB::table('coment_publicaciones')->insertGetId([
                    'publicacion_id' => $pubId,
                    'perf_persona_id' => $esPersona ? $personasIds[array_rand($personasIds)] : null,
                    'perf_institucion_id' => !$esPersona ? $institucionesIds[array_rand($institucionesIds)] : null,
                    'contenido' => "Este es un comentario de ejemplo. " . ($i % 3 == 0 ? "Muy interesante!" : ($i % 3 == 1 ? "Gracias por compartir." : "Excelente información.")),
                    'coment_padre_id' => null,
                    'eliminado' => rand(0, 20) === 0, // 5% eliminado
                    'oculto' => rand(0, 30) === 0, // 3% oculto
                    'created_at' => now()->subDays(rand(1, 60)),
                    'updated_at' => now(),
                ]);
                $comentariosIds[] = $comentarioId;

                // Algunas respuestas a comentarios
                if (rand(0, 2) === 0) {
                    $esPersonaResp = rand(0, 1);
                    DB::table('coment_publicaciones')->insert([
                        'publicacion_id' => $pubId,
                        'perf_persona_id' => $esPersonaResp ? $personasIds[array_rand($personasIds)] : null,
                        'perf_institucion_id' => !$esPersonaResp ? $institucionesIds[array_rand($institucionesIds)] : null,
                        'contenido' => "Respuesta al comentario anterior.",
                        'coment_padre_id' => $comentarioId,
                        'eliminado' => false,
                        'oculto' => false,
                        'created_at' => now()->subDays(rand(1, 50)),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // ==================== LIKES ====================
        $likesCreados = [];
        foreach ($publicacionesIds as $pubId) {
            $numLikes = rand(5, 30);
            for ($i = 0; $i < $numLikes; $i++) {
                $esPersona = rand(0, 1);
                $perfId = $esPersona ? $personasIds[array_rand($personasIds)] : $institucionesIds[array_rand($institucionesIds)];
                $tipo = $esPersona ? 'persona' : 'institucion';

                $key = "{$tipo}_{$perfId}_publicacion_{$pubId}";
                if (!isset($likesCreados[$key])) {
                    DB::table('likes')->insert([
                        'perf_persona_id' => $esPersona ? $perfId : null,
                        'perf_institucion_id' => !$esPersona ? $perfId : null,
                        'target_id' => $pubId,
                        'target_tipo' => 'publicacion',
                        'created_at' => now()->subDays(rand(1, 80)),
                        'updated_at' => now(),
                    ]);
                    $likesCreados[$key] = true;
                }
            }
        }

        // Likes en comentarios
        foreach (array_slice($comentariosIds, 0, 50) as $comId) {
            $numLikes = rand(0, 10);
            for ($i = 0; $i < $numLikes; $i++) {
                $esPersona = rand(0, 1);
                $perfId = $esPersona ? $personasIds[array_rand($personasIds)] : $institucionesIds[array_rand($institucionesIds)];
                $tipo = $esPersona ? 'persona' : 'institucion';

                $key = "{$tipo}_{$perfId}_comentario_{$comId}";
                if (!isset($likesCreados[$key])) {
                    DB::table('likes')->insert([
                        'perf_persona_id' => $esPersona ? $perfId : null,
                        'perf_institucion_id' => !$esPersona ? $perfId : null,
                        'target_id' => $comId,
                        'target_tipo' => 'comentario',
                        'created_at' => now()->subDays(rand(1, 70)),
                        'updated_at' => now(),
                    ]);
                    $likesCreados[$key] = true;
                }
            }
        }

        // ==================== FAVORITOS ====================
        $favoritosCreados = [];
        foreach ($personasIds as $persId) {
            $numFavoritos = rand(2, 10);
            $pubsAleatorias = array_rand(array_flip($publicacionesIds), min($numFavoritos, count($publicacionesIds)));
            if (!is_array($pubsAleatorias)) $pubsAleatorias = [$pubsAleatorias];

            foreach ($pubsAleatorias as $pubId) {
                $key = "persona_{$persId}_{$pubId}";
                if (!isset($favoritosCreados[$key])) {
                    DB::table('favoritos')->insert([
                        'perf_persona_id' => $persId,
                        'perf_institucion_id' => null,
                        'publicacion_id' => $pubId,
                        'created_at' => now()->subDays(rand(1, 60)),
                        'updated_at' => now(),
                    ]);
                    $favoritosCreados[$key] = true;
                }
            }
        }

        // Favoritos de instituciones
        foreach (array_slice($institucionesIds, 0, 5) as $instId) {
            $numFavoritos = rand(1, 5);
            $pubsAleatorias = array_rand(array_flip($publicacionesIds), min($numFavoritos, count($publicacionesIds)));
            if (!is_array($pubsAleatorias)) $pubsAleatorias = [$pubsAleatorias];

            foreach ($pubsAleatorias as $pubId) {
                $key = "institucion_{$instId}_{$pubId}";
                if (!isset($favoritosCreados[$key])) {
                    DB::table('favoritos')->insert([
                        'perf_persona_id' => null,
                        'perf_institucion_id' => $instId,
                        'publicacion_id' => $pubId,
                        'created_at' => now()->subDays(rand(1, 60)),
                        'updated_at' => now(),
                    ]);
                    $favoritosCreados[$key] = true;
                }
            }
        }

        // ==================== INSTITUCION MATERIAL ====================
        $materialesIds = [];
        $nombresCursos = [
            'Programación Web Full Stack',
            'Marketing Digital Avanzado',
            'Diseño Gráfico Profesional',
            'Inglés de Negocios',
            'Contabilidad Básica',
            'Gestión de Proyectos',
            'Fotografía Digital',
            'Excel Avanzado',
        ];

        $nombresCarreras = [
            'Ingeniería en Sistemas de Información',
            'Licenciatura en Administración de Empresas',
            'Tecnicatura en Programación',
            'Profesorado en Educación',
            'Enfermería Universitaria',
            'Arquitectura',
        ];

        foreach ($institucionesIds as $instId) {
            // Cursos
            for ($i = 1; $i <= 4; $i++) {
                $materialId = DB::table('institucion_material')->insertGetId([
                    'perf_institucion_id' => $instId,
                    'tipo' => 'curso',
                    'nombre' => $nombresCursos[array_rand($nombresCursos)],
                    'contenido' => "Descripción completa del curso. Incluye módulos teóricos y prácticos.",
                    'categorias' => json_encode($this->getRandomCategorias(1, 3)),
                    'plan_estudios' => json_encode(["planes/curso_{$instId}_{$i}_plan.pdf"]),
                    'publicado' => rand(0, 10) > 1,
                    'duracion' => rand(30, 360), // días
                    'modalidad' => ['presencial', 'virtual', 'híbrida'][rand(0, 2)],
                    'created_at' => now()->subDays(rand(1, 180)),
                    'updated_at' => now(),
                ]);
                $materialesIds[] = $materialId;
            }

            // Carreras
            for ($i = 1; $i <= 2; $i++) {
                $materialId = DB::table('institucion_material')->insertGetId([
                    'perf_institucion_id' => $instId,
                    'tipo' => 'carrera',
                    'nombre' => $nombresCarreras[array_rand($nombresCarreras)],
                    'contenido' => "Información completa de la carrera. Plan de estudios de " . rand(2, 5) . " años.",
                    'categorias' => json_encode($this->getRandomCategorias(2, 4)),
                    'plan_estudios' => json_encode([
                        "planes/carrera_{$instId}_{$i}_anio1.pdf",
                        "planes/carrera_{$instId}_{$i}_anio2.pdf"
                    ]),
                    'publicado' => true,
                    'duracion' => rand(720, 1800), // días
                    'modalidad' => ['presencial', 'híbrida'][rand(0, 1)],
                    'created_at' => now()->subDays(rand(1, 300)),
                    'updated_at' => now(),
                ]);
                $materialesIds[] = $materialId;
            }
        }

        // ==================== MATERIAL GUARDADO ====================
        $materialGuardadoCreado = [];
        foreach ($personasIds as $index => $persId) {
            // Obtener user_id de la persona
            $userId = DB::table('perf_persona')->where('id', $persId)->value('user_id');

            $numMateriales = rand(2, 8);
            $matsAleatorios = array_rand(array_flip($materialesIds), min($numMateriales, count($materialesIds)));
            if (!is_array($matsAleatorios)) $matsAleatorios = [$matsAleatorios];

            foreach ($matsAleatorios as $matId) {
                $key = "{$userId}_{$matId}";
                if (!isset($materialGuardadoCreado[$key])) {
                    DB::table('material_guardado')->insert([
                        'user_id' => $userId,
                        'material_id' => $matId,
                        'created_at' => now()->subDays(rand(1, 90)),
                        'updated_at' => now(),
                    ]);
                    $materialGuardadoCreado[$key] = true;
                }
            }
        }

        $this->command->info('✅ Base de datos sembrada exitosamente!');
        $this->command->info("📊 Resumen:");
        $this->command->info("   - Personas: " . count($personasIds));
        $this->command->info("   - Instituciones: " . count($institucionesIds));
        $this->command->info("   - Publicaciones: " . count($publicacionesIds));
        $this->command->info("   - Materiales: " . count($materialesIds));
    }
}
