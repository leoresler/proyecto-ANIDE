<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class DatosDePruebaSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_AR');

        $users = [];
        $personas = [];
        $instituciones = [];
        $publicaciones = [];
        $publicacionMedia = [];

        // === 50 Usuarios tipo PERSONA ===
        for ($i = 1; $i <= 50; $i++) {
            $userId = $i;

            $users[] = [
                'id' => $userId,
                'email' => $faker->unique()->safeEmail(),
                'profile_photo_path' => null,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'nombre' => $faker->firstName(),
                'telefono' => $faker->phoneNumber(),
                'ciudad' => $faker->city(),
                'provincia' => $faker->state(),
                'tipo_usuario' => 'persona',
                'estado' => 'activo',
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $personas[] = [
                'user_id' => $userId,
                'apellido' => $faker->lastName(),
                'fecha_nac' => $faker->date('Y-m-d', '-20 years'),
                'interests' => json_encode($faker->randomElements([
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
                    "Idiomas"
                ], 3)),
                'biografia' => $faker->sentence(10),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // === 50 Usuarios tipo INSTITUCIÓN ===
        for ($i = 51; $i <= 100; $i++) {
            $userId = $i;

            $users[] = [
                'id' => $userId,
                'email' => $faker->unique()->safeEmail(),
                'profile_photo_path' => null,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'nombre' => $faker->company(),
                'telefono' => $faker->phoneNumber(),
                'ciudad' => $faker->city(),
                'provincia' => $faker->state(),
                'tipo_usuario' => 'institucion',
                'estado' => 'activo',
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $instituciones[] = [
                'user_id' => $userId,
                'doc_identificador' => $faker->unique()->numerify('CUIT########'),
                'tipo_documento' => 'CUIT',
                'tipo_institucion' => $faker->randomElement(['Universidad', 'Escuela', 'Fundacion', 'ONG', 'Empresa']),
                'direccion' => $faker->address(),
                'url_sitio_web' => $faker->url(),
                'cantidad_seguidores' => $faker->numberBetween(100, 5000),
                'descripcion' => $faker->paragraph(),
                'interests' => json_encode($faker->randomElements([
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
                    "Idiomas"
                ], 3)),
                'latitud' => $faker->latitude(-55, -21),
                'longitud' => $faker->longitude(-73, -53),
                'verificado' => $faker->boolean(70),
                'approval_token' => Str::random(20),
                'ano_fundacion' => $faker->year(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // === 100 Publicaciones (solo de instituciones) ===
        for ($i = 1; $i <= 100; $i++) {
            $perfInstitucionId = $faker->numberBetween(1, count($instituciones));
            $publicaciones[] = [
                'perf_institucion_id' => $perfInstitucionId,
                'titulo' => ucfirst($faker->sentence(4)),
                'contenido' => $faker->paragraph(5),
                'categorias' => json_encode(
                    $faker->randomElements([
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
                        "Idiomas"
                    ], 2)
                ),
                'publicado' => $faker->boolean(90),
                'count_visualizaciones' => $faker->numberBetween(10, 2000),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Media asociada (1 a 3 por publicación)
            $cantidadMedia = $faker->numberBetween(1, 3);
            for ($j = 1; $j <= $cantidadMedia; $j++) {
                $publicacionMedia[] = [
                    'publicacion_id' => $i,
                    'tipo' => $faker->randomElement(['imagen', 'video']),
                    'url' => $faker->imageUrl(800, 600, 'nature', true, 'Post'),
                    'orden' => $j,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // === Insertar todo en la BD ===
        DB::table('users')->insert($users);
        DB::table('perf_persona')->insert($personas);
        DB::table('perf_institucion')->insert($instituciones);
        DB::table('publicaciones')->insert($publicaciones);
        DB::table('publicacion_media')->insert($publicacionMedia);
    }
}
