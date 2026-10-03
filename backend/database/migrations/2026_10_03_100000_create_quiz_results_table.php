<?php

use HiEvents\DomainObjects\Enums\QuizAgeBand;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers')->onDelete('cascade');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 255);
            $table->enum('age_band', QuizAgeBand::valuesArray());
            $table->unsignedSmallInteger('score');
            $table->unsignedSmallInteger('total_questions');
            $table->unsignedSmallInteger('percentage');
            $table->timestamp('taken_at');
            $table->timestamps();

            $table->index('organizer_id');
            $table->index('email');
            $table->index(['organizer_id', 'age_band']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_results');
    }
};
