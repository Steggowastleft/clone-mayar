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
            $table->string('author')->nullable();
            $table->string('isbn')->nullable();
            $table->string('format')->nullable(); // pdf, epub, dll
            $table->string('bahasa')->nullable();
            $table->integer('jumlah_halaman')->nullable();
            $table->date('tanggal_publish')->nullable();
            $table->boolean('bisa_didownload')->default(true);
            
            $table->string('tipe_tulisan')->nullable(); // one_shot, chapter
            $table->string('mekanisme_bayar')->nullable(); // per_chapter, semua_chapter, sekali_bayar
            $table->string('genre')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produk_digitals', function (Blueprint $table) {
            $table->dropColumn([
                'author', 'isbn', 'format', 'bahasa', 'jumlah_halaman', 
                'tanggal_publish', 'bisa_didownload', 'tipe_tulisan', 
                'mekanisme_bayar', 'genre'
            ]);
        });
    }
};
