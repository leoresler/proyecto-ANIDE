<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ubicaciones_guardadas', function (Blueprint $table) {
            $table->id();

            // FK a persona
            $table->unsignedBigInteger('persona_id');
            $table->foreign('persona_id')
                ->references('id')
                ->on('perf_persona')
                ->onDelete('cascade');

            // FK a institución
            $table->unsignedBigInteger('institucion_id');
            $table->foreign('institucion_id')
                ->references('id')
                ->on('perf_institucion')
                ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ubicaciones_guardadas');
    }
};
