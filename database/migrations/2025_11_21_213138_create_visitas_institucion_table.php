<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitas_institucion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('perf_institucion_id')->constrained('perf_institucion')->onDelete('cascade');
            $table->timestamp('visited_at');
            $table->timestamps();

            // Índice único para evitar duplicados
            $table->unique(['user_id', 'perf_institucion_id']);

            // Índice para ordenar por fecha de visita
            $table->index(['user_id', 'visited_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitas_institucion');
    }
};
