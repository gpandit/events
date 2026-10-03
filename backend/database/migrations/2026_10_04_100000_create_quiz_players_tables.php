<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_username_characters', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->timestamps();
        });

        Schema::create('quiz_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers')->onDelete('cascade');
            $table->string('username', 60);
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 255);
            $table->string('password');
            $table->timestamps();

            $table->unique(['organizer_id', 'username']);
        });

        $now = now();
        $rows = array_map(
            fn (string $name) => ['name' => $name, 'created_at' => $now, 'updated_at' => $now],
            require database_path('data/quiz_username_characters.php'),
        );

        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('quiz_username_characters')->insert($chunk);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_players');
        Schema::dropIfExists('quiz_username_characters');
    }
};
