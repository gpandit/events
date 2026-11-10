<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('slot_booking_configs', function (Blueprint $table) {
            $table->foreignId('ticket_event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->foreignId('grotto_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->json('child_product_ids')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('slot_booking_configs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('ticket_event_id');
            $table->dropConstrainedForeignId('grotto_product_id');
            $table->dropColumn('child_product_ids');
        });
    }
};
