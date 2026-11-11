<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slot_booking_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->unique()->constrained('events')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->unsignedSmallInteger('slot_minutes');
            $table->unsignedSmallInteger('children_per_slot');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slot_booking_configs');
    }
};
