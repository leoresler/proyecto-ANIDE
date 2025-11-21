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
        Schema::table('chats', function (Blueprint $table) {
            $table->timestamp('persona_deleted_at')->nullable()->after('institucion_id');
            $table->timestamp('institucion_deleted_at')->nullable()->after('persona_deleted_at');
        });
    }

    public function down()
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn('persona_deleted_at');
            $table->dropColumn('institucion_deleted_at');
        });
    }

};
