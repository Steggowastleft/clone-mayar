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
        Schema::table('produk_digitals', function (Blueprint $table) {
            $table->text('transkrip')->nullable();
            $table->string('pembicara')->nullable();
            $table->string('durasi')->nullable();
            $table->string('artis')->nullable();
            $table->string('kategori_produk')->nullable();
            $table->string('tipe_pembaca')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produk_digitals', function (Blueprint $table) {
            $table->dropColumn([
                'transkrip', 'pembicara', 'durasi', 'artis', 'kategori_produk', 'tipe_pembaca'
            ]);
        });
    }
};
