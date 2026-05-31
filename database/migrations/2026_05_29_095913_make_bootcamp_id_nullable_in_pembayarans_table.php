<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pembayarans', function (Blueprint $table) {
            $table->dropForeign(['bootcamp_id']);
            $table->unsignedBigInteger('bootcamp_id')->nullable()->change();
            $table->foreign('bootcamp_id')->references('id')->on('bootcamps')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembayarans', function (Blueprint $table) {
            $table->dropForeign(['bootcamp_id']);
            $table->unsignedBigInteger('bootcamp_id')->nullable(false)->change();
            $table->foreign('bootcamp_id')->references('id')->on('bootcamps')->cascadeOnDelete();
        });
    }
};
