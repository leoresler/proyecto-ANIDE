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
        Schema::create('residencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perf_institucion_id')
                ->constrained('perf_institucion')
                ->onDelete('cascade');

            $table->string('nombre');
            $table->string('direccion');
            $table->string('contacto');
            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->unsignedInteger('capacidad')->nullable();
            $table->string('foto_portada')->nullable();
            $table->text('info_adicional')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residencias');
    }
};
