<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('institucion_material', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perf_institucion_id')->constrained('perf_institucion')->onDelete('cascade');
            $table->enum('tipo', ['curso', 'carrera']);
            $table->string('nombre');
            $table->text('contenido'); // toda la informacion que desea ingresar
            $table->json('categorias')->nullable();
            $table->json('plan_estudios')->nullable(); // array de rutas de archivos PDF
            $table->boolean('publicado')->default(true);
            $table->integer('duracion')->nullable();
            $table->string('modalidad')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tipo');
            $table->index('publicado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institucion_material');
    }
};
