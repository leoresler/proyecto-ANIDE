<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            // indice unico compuesto
            $table->unique(['perf_persona_id', 'target_id', 'target_tipo'], 'unique_like_persona');
            $table->unique(['perf_institucion_id', 'target_id', 'target_tipo'], 'unique_like_institucion');
        });
    }

    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->dropUnique('unique_like_persona');
            $table->dropUnique('unique_like_institucion');
        });
    }
};
