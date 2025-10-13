<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('favoritos', function (Blueprint $table) {
            $table->unique(['perf_persona_id', 'publicacion_id'], 'unique_favorito');
        });
    }

    public function down(): void
    {
        Schema::table('favoritos', function (Blueprint $table) {
            $table->dropUnique('unique_favorito');
        });
    }
};
