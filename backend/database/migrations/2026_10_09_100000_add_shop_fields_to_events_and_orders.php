<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', static function (Blueprint $table) {
            $table->boolean('is_shop')->default(false);
            $table->string('shop_category', 30)->nullable();
            $table->string('vendor_type', 20)->nullable();
            $table->index(['organizer_id', 'is_shop']);
        });

        Schema::table('orders', static function (Blueprint $table) {
            $table->string('collection_status', 20)->nullable();
            $table->timestamp('ready_for_collection_at')->nullable();
            $table->timestamp('collected_at')->nullable();
            $table->index(['event_id', 'collection_status']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', static function (Blueprint $table) {
            $table->dropIndex(['event_id', 'collection_status']);
            $table->dropColumn(['collection_status', 'ready_for_collection_at', 'collected_at']);
        });

        Schema::table('events', static function (Blueprint $table) {
            $table->dropIndex(['organizer_id', 'is_shop']);
            $table->dropColumn(['is_shop', 'shop_category', 'vendor_type']);
        });
    }
};
