<?php

use HiEvents\DomainObjects\Enums\ChildStorySubmissionType;
use HiEvents\DomainObjects\Status\ChildStorySubmissionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_story_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers')->onDelete('cascade');
            $table->enum('type', ChildStorySubmissionType::valuesArray());
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('year_group', 50);
            $table->longText('content');
            $table->string('original_filename')->nullable();
            $table->boolean('consent_own_work')->default(false);
            $table->boolean('consent_publish')->default(false);
            $table->enum('status', ChildStorySubmissionStatus::valuesArray())
                ->default(ChildStorySubmissionStatus::PENDING->value);
            $table->timestamp('submitted_at');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('organizer_id');
            $table->index('status');
            $table->index(['organizer_id', 'status']);
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_story_submissions');
    }
};
