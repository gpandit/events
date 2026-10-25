<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('organizer_settings')->orderBy('id')->each(function (object $row) {
            $theme = json_decode($row->homepage_theme_settings ?? '[]', true) ?: [];

            $theme['team_members'] = array_map(
                static fn (string $name) => ['name' => $name],
                $theme['team_members'] ?? [],
            );
            $theme += [
                'technical_team_heading' => 'Technical Team',
                'technical_team_members' => [['name' => 'Guru Pandit']],
            ];

            DB::table('organizer_settings')
                ->where('id', $row->id)
                ->update(['homepage_theme_settings' => json_encode($theme)]);
        });
    }

    public function down(): void
    {
        DB::table('organizer_settings')->orderBy('id')->each(function (object $row) {
            $theme = json_decode($row->homepage_theme_settings ?? '[]', true) ?: [];

            $theme['team_members'] = array_map(
                static fn (array $member) => $member['name'],
                $theme['team_members'] ?? [],
            );
            unset($theme['technical_team_heading'], $theme['technical_team_members']);

            DB::table('organizer_settings')
                ->where('id', $row->id)
                ->update(['homepage_theme_settings' => json_encode($theme)]);
        });
    }
};
