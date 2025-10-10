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
        Schema::table('perf_institucion', function (Blueprint $table) {
            // Documento identificador: CUIT, DNI responsable.
            $table->string('doc_identificador', 50)->nullable()->after('user_id');
            $table->enum('tipo_documento', ['CUIT', 'CUIL', 'DNI'])->default('CUIT')->after('doc_identificador');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perf_institucion', function (Blueprint $table) {
            $table->dropColumn(['doc_identificador', 'tipo_documento']);
        });
    }
};
