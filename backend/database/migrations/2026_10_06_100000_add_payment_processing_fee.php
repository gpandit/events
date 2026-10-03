<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizer_configurations', function (Blueprint $table) {
            $table->string('payment_processing_fee_mode', 20)->default('HIDE');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('payment_processing_fee', 14, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('payment_processing_fee');
        });

        Schema::table('organizer_configurations', function (Blueprint $table) {
            $table->dropColumn('payment_processing_fee_mode');
        });
    }
};
