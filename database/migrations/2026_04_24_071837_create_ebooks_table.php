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
        Schema::create('ebooks', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama');
            $table->string('url')->nullable();
            $table->string('tipe_pembayaran')->nullable();
            $table->integer('harga')->default(0);
            $table->integer('harga_coret')->nullable();
            $table->text('deskripsi')->nullable();
            $table->string('cover')->nullable();
            $table->dateTime('tanggal_mulai_jual')->nullable();
            $table->dateTime('tanggal_kadaluarsa')->nullable();
            $table->text('catatan')->nullable();
            $table->integer('max_pembayaran')->nullable();
            $table->string('sumber_file')->nullable();
            $table->string('file_url')->nullable();
            $table->boolean('bisa_didownload')->default(true);
            $table->string('author')->nullable();
            $table->string('isbn')->nullable();
            $table->string('format')->nullable();
            $table->string('bahasa')->nullable();
            $table->integer('jumlah_halaman')->nullable();
            $table->date('tanggal_publish')->nullable();
            $table->boolean('affiliate_enabled')->default(false);
            $table->string('status')->default('unpublished');
            $table->integer('terjual')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ebooks');
    }
};
