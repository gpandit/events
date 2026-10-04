<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $rows = array_map(
            fn (string $name) => ['name' => $name, 'created_at' => $now, 'updated_at' => $now],
            require database_path('data/quiz_username_characters_india_uae_england.php'),
        );

        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('quiz_username_characters')->insertOrIgnore($chunk);
        }
    }

    public function down(): void
    {
        DB::table('quiz_username_characters')
            ->whereIn('name', require database_path('data/quiz_username_characters_india_uae_england.php'))
            ->delete();
    }
};
