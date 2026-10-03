<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_players', function (Blueprint $table) {
            $table->string('email', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('quiz_players')->whereNull('email')->update(['email' => '']);

        Schema::table('quiz_players', function (Blueprint $table) {
            $table->string('email', 255)->nullable(false)->change();
        });
    }
};
