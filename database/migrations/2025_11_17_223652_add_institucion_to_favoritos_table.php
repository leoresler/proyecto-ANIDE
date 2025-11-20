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
        Schema::table('favoritos', function (Blueprint $table) {
            // Agregar columna para instituciones (nullable)
            $table->unsignedBigInteger('perf_institucion_id')->nullable()->after('perf_persona_id');

            // Agregar foreign key
            $table->foreign('perf_institucion_id')
                ->references('id')
                ->on('perf_institucion')
                ->onDelete('cascade');

            // Modificar perf_persona_id para que sea nullable
            $table->unsignedBigInteger('perf_persona_id')->nullable()->change();

            // Agregar índice compuesto para búsquedas más rápidas
            $table->index(['perf_persona_id', 'publicacion_id']);
            $table->index(['perf_institucion_id', 'publicacion_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('favoritos', function (Blueprint $table) {
            $table->dropForeign(['perf_institucion_id']);
            $table->dropIndex(['perf_persona_id', 'publicacion_id']);
            $table->dropIndex(['perf_institucion_id', 'publicacion_id']);
            $table->dropColumn('perf_institucion_id');
        });
    }
};
