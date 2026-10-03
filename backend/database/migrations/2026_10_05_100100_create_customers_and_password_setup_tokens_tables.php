<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers')->onDelete('cascade');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email', 255);
            $table->string('phone', 30)->nullable();
            $table->string('password')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();

            $table->unique(['organizer_id', 'email']);
        });

        Schema::create('password_setup_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('subject_type', 30);
            $table->unsignedBigInteger('subject_id');
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['subject_type', 'subject_id']);
        });

        DB::statement(<<<'SQL'
            INSERT INTO customers (organizer_id, first_name, last_name, email, created_at, updated_at)
            SELECT DISTINCT ON (events.organizer_id, LOWER(orders.email))
                events.organizer_id,
                LEFT(COALESCE(orders.first_name, ''), 100),
                LEFT(COALESCE(orders.last_name, ''), 100),
                LOWER(orders.email),
                NOW(),
                NOW()
            FROM orders
            JOIN events ON events.id = orders.event_id
            WHERE orders.status = 'COMPLETED'
              AND orders.deleted_at IS NULL
              AND orders.email IS NOT NULL
              AND events.organizer_id IS NOT NULL
            ORDER BY events.organizer_id, LOWER(orders.email), orders.created_at DESC
        SQL);
    }

    public function down(): void
    {
        Schema::dropIfExists('password_setup_tokens');
        Schema::dropIfExists('customers');
    }
};
