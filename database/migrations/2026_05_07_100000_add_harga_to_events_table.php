<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add harga column after nama for bundling compatibility
            $table->unsignedBigInteger('harga')->default(0)->after('nama');
            $table->unsignedBigInteger('harga_coret')->nullable()->after('harga');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['harga', 'harga_coret']);
        });
    }
};
