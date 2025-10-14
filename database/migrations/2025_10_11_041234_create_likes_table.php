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
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perf_persona_id')->nullable()->constrained('perf_persona')->onDelete('cascade');
            $table->foreignId('perf_institucion_id')->nullable()->constrained('perf_institucion')->onDelete('cascade');
            $table->unsignedBigInteger('target_id'); // id del elemento al que da like
            $table->enum('target_tipo', ['publicacion', 'comentario']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
