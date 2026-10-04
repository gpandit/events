<?php

use HiEvents\DomainObjects\Enums\ParentalConsentSubject;
use HiEvents\DomainObjects\Status\ParentalConsentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parental_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers')->onDelete('cascade');
            $table->enum('subject_type', ParentalConsentSubject::valuesArray());
            $table->unsignedBigInteger('subject_id');
            $table->string('parent_email', 255);
            $table->string('token_hash', 64)->unique();
            $table->enum('status', ParentalConsentStatus::valuesArray())
                ->default(ParentalConsentStatus::PENDING->value);
            $table->timestamp('requested_at');
            $table->timestamp('expires_at');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['subject_type', 'subject_id']);
            $table->index('organizer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parental_consents');
    }
};
