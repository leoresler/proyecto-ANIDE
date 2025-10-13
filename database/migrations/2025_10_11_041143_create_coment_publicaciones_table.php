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
        Schema::create('coment_publicaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('publicacion_id')->constrained('publicaciones')->onDelete('cascade');
            $table->foreignId('perf_persona_id')->nullable()->constrained('perf_persona')->onDelete('cascade');
            $table->foreignId('perf_institucion_id')->nullable()->constrained('perf_institucion')->onDelete('cascade');
            $table->text('contenido');
            $table->foreignId('coment_padre_id')->nullable()->constrained('coment_publicaciones')->onDelete('cascade');
            $table->boolean('oculto')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coment_publicaciones');
    }
};
