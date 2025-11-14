<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mensajes', function (Blueprint $table) {
            if (!Schema::hasColumn('mensajes', 'leido')) {
                $table->boolean('leido')->default(false)->after('contenido');
            }
        });
    }

    public function down(): void
    {
        Schema::table('mensajes', function (Blueprint $table) {
            if (Schema::hasColumn('mensajes', 'leido')) {
                $table->dropColumn('leido');
            }
        });
    }
};
