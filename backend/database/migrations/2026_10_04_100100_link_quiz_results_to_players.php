<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('quiz_results')->delete();

        Schema::table('quiz_results', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropColumn(['first_name', 'last_name', 'email']);
            $table->foreignId('quiz_player_id')->constrained('quiz_players')->onDelete('cascade');
            $table->unsignedInteger('points')->default(0);

            $table->index(['organizer_id', 'age_band', 'quiz_player_id']);
            $table->index('quiz_player_id');
        });
    }

    public function down(): void
    {
        DB::table('quiz_results')->delete();

        Schema::table('quiz_results', function (Blueprint $table) {
            $table->dropIndex(['organizer_id', 'age_band', 'quiz_player_id']);
            $table->dropConstrainedForeignId('quiz_player_id');
            $table->dropColumn('points');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 255)->index();
        });
    }
};
