<?php

use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const BUNDLED_PAGES = [
        ['title' => 'Kawaii Cat', 'file' => 'kawaii-cat-coloring-page', 'tint' => ColouringPageTint::PEACH->value],
        ['title' => 'Cute Kawaii Unicorn', 'file' => 'cute-kawaii-unicorn-coloring-page', 'tint' => ColouringPageTint::LILAC->value],
        ['title' => 'Kawaii Bubble Tea', 'file' => 'kawaii-bubble-tea-coloring-page', 'tint' => ColouringPageTint::SKY->value],
        ['title' => 'Cupcake & Coffee', 'file' => 'kawaii-cupcake-and-coffee-coloring-page', 'tint' => ColouringPageTint::PEACH->value],
        ['title' => 'Kawaii Frog', 'file' => 'kawaii-frog-coloring-page', 'tint' => ColouringPageTint::MINT->value],
        ['title' => 'Mushroom Friend', 'file' => 'kawaii-mushroom-friend-coloring-page', 'tint' => ColouringPageTint::MINT->value],
        ['title' => 'Kawaii Food', 'file' => 'kawaii-food-coloring-page', 'tint' => ColouringPageTint::PEACH->value],
        ['title' => 'Kawaii Headphones', 'file' => 'kawaii-headphones-coloring-page', 'tint' => ColouringPageTint::SKY->value],
        ['title' => 'Kawaii Anime Friend', 'file' => 'kawaii-anime-coloring-page', 'tint' => ColouringPageTint::LILAC->value],
        ['title' => 'Cute Christmas', 'file' => 'kawaii-cute-christmas-coloring-page', 'tint' => ColouringPageTint::SKY->value],
        ['title' => 'Summer Kawaii', 'file' => 'summer-kawaii-coloring-page', 'tint' => ColouringPageTint::MINT->value],
        ['title' => 'Creepy Kawaii', 'file' => 'creepy-kawaii-coloring-page', 'tint' => ColouringPageTint::LILAC->value],
    ];

    public function up(): void
    {
        DB::statement('ALTER TABLE colouring_pages ALTER COLUMN organizer_id DROP NOT NULL');

        foreach (self::BUNDLED_PAGES as $page) {
            DB::table('colouring_pages')
                ->whereNotNull('organizer_id')
                ->where('pdf_path', $this->pdfPath($page))
                ->where('title', $page['title'])
                ->where('age_group', ColouringPageAgeGroup::AGE_6_10->value)
                ->where('status', ColouringPageStatus::PUBLISHED->value)
                ->delete();
        }

        DB::table('colouring_pages')->insert($this->rows(null));
    }

    public function down(): void
    {
        DB::table('colouring_pages')->whereNull('organizer_id')->delete();

        $rows = DB::table('organizers')->pluck('id')
            ->flatMap(fn (int $organizerId) => $this->rows($organizerId))
            ->all();

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('colouring_pages')->insert($chunk);
        }

        DB::statement('ALTER TABLE colouring_pages ALTER COLUMN organizer_id SET NOT NULL');
    }

    private function rows(?int $organizerId): array
    {
        $now = now();

        return array_map(fn (array $page, int $index) => [
            'organizer_id' => $organizerId,
            'title' => $page['title'],
            'age_group' => ColouringPageAgeGroup::AGE_6_10->value,
            'tint' => $page['tint'],
            'pdf_path' => $this->pdfPath($page),
            'thumbnail_path' => '/pdf-thumbnails/'.$page['file'].'.png',
            'status' => ColouringPageStatus::PUBLISHED->value,
            'sort_order' => $index,
            'created_at' => $now,
            'updated_at' => $now,
        ], self::BUNDLED_PAGES, array_keys(self::BUNDLED_PAGES));
    }

    private function pdfPath(array $page): string
    {
        return '/pdf/'.$page['file'].'.pdf';
    }
};
