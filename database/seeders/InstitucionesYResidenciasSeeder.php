<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PerfInstitucion;
use App\Models\Residencia;
use Illuminate\Support\Facades\Hash;

class InstitucionesYResidenciasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Instituciones de ejemplo en Neuquén Capital
        $instituciones = [
            [
                'user' => [
                    'email' => 'utn.neuquen@ejemplo.com',
                    'nombre' => 'Universidad Tecnológica Nacional - Facultad Regional Neuquén',
                    'telefono' => '299-448-2200',
                    'ciudad' => 'Neuquén',
                    'provincia' => 'Neuquén',
                ],
                'perfil' => [
                    'tipo_institucion' => 'Universidad',
                    'direccion' => 'Plaza Huincul 360',
                    'latitud' => -38.9516,
                    'longitud' => -68.0591,
                    'descripcion' => 'Universidad pública que ofrece carreras de Ingeniería Electrónica, Ingeniería Química, Ingeniería Civil, y más.',
                    'verificado' => true,
                    'ano_fundacion' => 1972,
                ],
                'residencias' => [
                    [
                        'nombre' => 'Residencia Universitaria N°1',
                        'direccion' => 'Av. Argentina 250',
                        'contacto' => '299-567-8900',
                        'latitud' => -38.9530,
                        'longitud' => -68.0600,
                        'capacidad' => 40,
                        'info_adicional' => 'Habitaciones compartidas, comedor, sala de estudio',
                    ],
                    [
                        'nombre' => 'Residencia Universitaria N°2',
                        'direccion' => 'Santa Fe 123',
                        'contacto' => '299-567-8901',
                        'latitud' => -38.9500,
                        'longitud' => -68.0620,
                        'capacidad' => 25,
                        'info_adicional' => 'Exclusivamente para mujeres. 15 habitaciones dobles. Las residencias cuentan con: baños, cocina, sala de lavado.',
                    ],
                ],
            ],
            [
                'user' => [
                    'email' => 'unco@ejemplo.com',
                    'nombre' => 'Universidad Nacional del Comahue',
                    'telefono' => '299-449-0300',
                    'ciudad' => 'Neuquén',
                    'provincia' => 'Neuquén',
                ],
                'perfil' => [
                    'tipo_institucion' => 'Universidad',
                    'direccion' => 'Buenos Aires 1400',
                    'latitud' => -38.9516,
                    'longitud' => -68.0591,
                    'descripcion' => 'Universidad nacional con múltiples facultades: Medicina, Ingeniería, Economía, Humanidades, y más.',
                    'verificado' => true,
                    'ano_fundacion' => 1972,
                ],
                'residencias' => [
                    [
                        'nombre' => 'Residencia UNCo - Sede Central',
                        'direccion' => 'Buenos Aires 1500',
                        'contacto' => '299-449-0350',
                        'latitud' => -38.9490,
                        'longitud' => -68.0660,
                        'capacidad' => 60,
                        'info_adicional' => 'Residencia con habitaciones individuales y compartidas',
                    ],
                ],
            ],
            [
                'user' => [
                    'email' => 'colegio.cpem@ejemplo.com',
                    'nombre' => 'CPEM N° 18',
                    'telefono' => '299-442-3456',
                    'ciudad' => 'Neuquén',
                    'provincia' => 'Neuquén',
                ],
                'perfil' => [
                    'tipo_institucion' => 'Secundaria',
                    'direccion' => 'Olascoaga 1234',
                    'latitud' => -38.9545,
                    'longitud' => -68.0578,
                    'descripcion' => 'Colegio público de nivel secundario con orientación en ciencias naturales.',
                    'verificado' => true,
                    'ano_fundacion' => 1985,
                ],
                'residencias' => [],
            ],
            [
                'user' => [
                    'email' => 'instituto.superior@ejemplo.com',
                    'nombre' => 'Instituto de Formación Docente N° 12',
                    'telefono' => '299-443-7890',
                    'ciudad' => 'Neuquén',
                    'provincia' => 'Neuquén',
                ],
                'perfil' => [
                    'tipo_institucion' => 'Instituto Terciario',
                    'direccion' => 'Juan B. Justo 456',
                    'latitud' => -38.9560,
                    'longitud' => -68.0610,
                    'descripcion' => 'Instituto terciario de formación docente para nivel inicial, primario y secundario.',
                    'verificado' => true,
                    'ano_fundacion' => 1990,
                ],
                'residencias' => [
                    [
                        'nombre' => 'Pensión Estudiantil San José',
                        'direccion' => 'San Martín 789',
                        'contacto' => '299-443-7895',
                        'latitud' => -38.9565,
                        'longitud' => -68.0615,
                        'capacidad' => 15,
                        'info_adicional' => 'Pensión privada cerca del instituto',
                    ],
                ],
            ],
            [
                'user' => [
                    'email' => 'centro.formacion@ejemplo.com',
                    'nombre' => 'Centro de Formación Profesional N° 4',
                    'telefono' => '299-445-1234',
                    'ciudad' => 'Neuquén',
                    'provincia' => 'Neuquén',
                ],
                'perfil' => [
                    'tipo_institucion' => 'Centro de Formación',
                    'direccion' => 'Perito Moreno 321',
                    'latitud' => -38.9600,
                    'longitud' => -68.0550,
                    'descripcion' => 'Cursos de oficios: Electricidad, Gastronomía, Informática, Mecánica.',
                    'verificado' => true,
                    'ano_fundacion' => 2000,
                ],
                'residencias' => [],
            ],
        ];

        foreach ($instituciones as $data) {
            // Crear usuario
            $user = User::create([
                'email' => $data['user']['email'],
                'password' => Hash::make('password'), // Cambiar en producción
                'nombre' => $data['user']['nombre'],
                'telefono' => $data['user']['telefono'],
                'ciudad' => $data['user']['ciudad'],
                'provincia' => $data['user']['provincia'],
                'tipo_usuario' => 'institucion',
                'estado' => 'activo',
                'email_verified_at' => now(),
            ]);

            // Crear perfil de institución
            $institucion = PerfInstitucion::create([
                'user_id' => $user->id,
                'tipo_institucion' => $data['perfil']['tipo_institucion'],
                'direccion' => $data['perfil']['direccion'],
                'latitud' => $data['perfil']['latitud'],
                'longitud' => $data['perfil']['longitud'],
                'descripcion' => $data['perfil']['descripcion'],
                'verificado' => $data['perfil']['verificado'],
                'ano_fundacion' => $data['perfil']['ano_fundacion'],
            ]);

            // Crear residencias
            foreach ($data['residencias'] as $residenciaData) {
                Residencia::create([
                    'perf_institucion_id' => $institucion->id,
                    'nombre' => $residenciaData['nombre'],
                    'direccion' => $residenciaData['direccion'],
                    'contacto' => $residenciaData['contacto'],
                    'latitud' => $residenciaData['latitud'],
                    'longitud' => $residenciaData['longitud'],
                    'capacidad' => $residenciaData['capacidad'],
                    'info_adicional' => $residenciaData['info_adicional'],
                ]);
            }

            $this->command->info("✓ Creada institución: {$data['user']['nombre']}");
        }

        $this->command->info("\n✓ Seeder completado exitosamente!");
        $this->command->info("Total instituciones: " . count($instituciones));
    }
}

// Para ejecutar este seeder:
// php artisan db:seed --class=InstitucionesYResidenciasSeeder