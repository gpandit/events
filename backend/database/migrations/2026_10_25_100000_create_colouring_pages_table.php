<?php

use HiEvents\DomainObjects\Enums\ColouringPageAgeGroup;
use HiEvents\DomainObjects\Enums\ColouringPageTint;
use HiEvents\DomainObjects\Status\ColouringPageStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
        Schema::create('colouring_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers')->onDelete('cascade');
            $table->string('title', 150);
            $table->enum('age_group', ColouringPageAgeGroup::valuesArray());
            $table->enum('tint', ColouringPageTint::valuesArray());
            $table->string('pdf_path');
            $table->string('thumbnail_path');
            $table->enum('status', ColouringPageStatus::valuesArray())
                ->default(ColouringPageStatus::DRAFT->value);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['organizer_id', 'status', 'age_group', 'sort_order'], 'colouring_pages_listing_index');
        });

        $now = now();
        $rows = [];

        foreach (DB::table('organizers')->pluck('id') as $organizerId) {
            foreach (self::BUNDLED_PAGES as $index => $page) {
                $rows[] = [
                    'organizer_id' => $organizerId,
                    'title' => $page['title'],
                    'age_group' => ColouringPageAgeGroup::AGE_6_10->value,
                    'tint' => $page['tint'],
                    'pdf_path' => '/pdf/'.$page['file'].'.pdf',
                    'thumbnail_path' => '/pdf-thumbnails/'.$page['file'].'.png',
                    'status' => ColouringPageStatus::PUBLISHED->value,
                    'sort_order' => $index,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            DB::table('colouring_pages')->insert($chunk);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('colouring_pages');
    }
};
