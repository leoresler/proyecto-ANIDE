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
        Schema::table('perf_institucion', function (Blueprint $table) {
            $table->uuid('approval_token')->nullable()->unique()->after('verificado');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perf_institucion', function (Blueprint $table) {
            //
        });
    }
};
