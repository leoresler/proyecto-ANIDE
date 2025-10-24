<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('coment_publicaciones', function (Blueprint $table) {
            $table->boolean('eliminado')->default(false)->after('contenido');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coment_publicaciones', function (Blueprint $table) {
            $table->dropColumn('eliminado');
        });
    }
};
