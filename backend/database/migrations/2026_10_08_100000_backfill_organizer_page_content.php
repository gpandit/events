<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const DEFAULTS = [
        'upcoming_heading' => "What's happening at RAB",
        'about_text' => 'Friends of Repton has been supporting the school in managing various events onsite, including movie nights, socials, picnics, year-end balls, and Christmas and year-end events. It also takes an active part in making sure preloved uniforms find a good home.',
        'team_heading' => 'Meet the Friends of Repton team',
        'team_members' => ['Toria Ni', 'Emi Burrows'],
        'contact_email' => 'friendsofreptonalbarsha@gmail.com',
        'instagram_handle' => 'friendsofreptonab',
    ];

    public function up(): void
    {
        DB::table('organizer_settings')->orderBy('id')->each(function (object $row) {
            $theme = json_decode($row->homepage_theme_settings ?? '[]', true) ?: [];

            DB::table('organizer_settings')
                ->where('id', $row->id)
                ->update(['homepage_theme_settings' => json_encode($theme + self::DEFAULTS)]);
        });
    }

    public function down(): void
    {
        DB::table('organizer_settings')->orderBy('id')->each(function (object $row) {
            $theme = json_decode($row->homepage_theme_settings ?? '[]', true) ?: [];

            DB::table('organizer_settings')
                ->where('id', $row->id)
                ->update(['homepage_theme_settings' => json_encode(array_diff_key($theme, self::DEFAULTS))]);
        });
    }
};
