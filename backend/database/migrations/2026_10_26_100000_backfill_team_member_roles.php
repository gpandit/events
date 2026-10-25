<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const ROLE_DEFAULTS = [
        'team_members' => 'Parent',
        'technical_team_members' => 'Technical contact',
    ];

    public function up(): void
    {
        DB::table('organizer_settings')->orderBy('id')->each(function (object $row) {
            $theme = json_decode($row->homepage_theme_settings ?? '[]', true) ?: [];
            $changed = false;

            foreach (self::ROLE_DEFAULTS as $key => $defaultRole) {
                foreach ($theme[$key] ?? [] as $position => $member) {
                    if (is_array($member) && ! array_key_exists('role', $member)) {
                        $theme[$key][$position]['role'] = $defaultRole;
                        $changed = true;
                    }
                }
            }

            if ($changed) {
                DB::table('organizer_settings')
                    ->where('id', $row->id)
                    ->update(['homepage_theme_settings' => json_encode($theme)]);
            }
        });
    }

    public function down(): void
    {
        DB::table('organizer_settings')->orderBy('id')->each(function (object $row) {
            $theme = json_decode($row->homepage_theme_settings ?? '[]', true) ?: [];

            foreach (array_keys(self::ROLE_DEFAULTS) as $key) {
                foreach ($theme[$key] ?? [] as $position => $member) {
                    unset($theme[$key][$position]['role']);
                }
            }

            DB::table('organizer_settings')
                ->where('id', $row->id)
                ->update(['homepage_theme_settings' => json_encode($theme)]);
        });
    }
};
