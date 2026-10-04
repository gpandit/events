<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('pii_erased_at')->nullable();
        });

        Schema::create('data_erasure_requests', function (Blueprint $table) {
            $table->id();
            $table->string('email_hash', 64)->index();
            $table->json('order_ids');
            $table->unsignedInteger('orders_count')->default(0);
            $table->unsignedInteger('attendees_count')->default(0);
            $table->unsignedInteger('child_records_count')->default(0);
            $table->timestamp('erased_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_erasure_requests');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('pii_erased_at');
        });
    }
};
