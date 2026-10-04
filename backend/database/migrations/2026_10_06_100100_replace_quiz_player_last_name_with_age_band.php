<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_players', function (Blueprint $table) {
            $table->dropColumn('last_name');
            $table->string('age_band', 10)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('quiz_players', function (Blueprint $table) {
            $table->dropColumn('age_band');
            $table->string('last_name', 100)->default('');
        });
    }
};
