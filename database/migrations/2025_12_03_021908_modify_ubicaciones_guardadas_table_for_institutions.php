<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ubicaciones_guardadas', function (Blueprint $table) {
            // Hacer persona_id nullable para que las instituciones también puedan guardar
            $table->unsignedBigInteger('persona_id')->nullable()->change();
            
            // Agregar columna para instituciones que guardan
            $table->unsignedBigInteger('guardador_institucion_id')->nullable()->after('persona_id');
            $table->foreign('guardador_institucion_id')
                ->references('id')
                ->on('perf_institucion')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('ubicaciones_guardadas', function (Blueprint $table) {
            $table->dropForeign(['guardador_institucion_id']);
            $table->dropColumn('guardador_institucion_id');
            
            // Volver persona_id a no nullable
            $table->unsignedBigInteger('persona_id')->nullable(false)->change();
        });
    }
};