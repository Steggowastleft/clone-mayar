<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produk_digitals', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');

            // Informasi Dasar
            $table->string('nama', 200);
            $table->text('deskripsi');
            $table->string('slug')->unique()->nullable();

            // Harga
            $table->enum('tipe_pembayaran', ['berbayar', 'gratis'])->default('berbayar');
            $table->unsignedBigInteger('harga')->default(0);         // in IDR (rupiah)
            $table->unsignedBigInteger('harga_coret')->nullable();   // strike price

            // File / Konten
            $table->enum('sumber_file', ['upload', 'file_lama', 'link'])->default('upload');
            $table->string('file_path')->nullable();                 // path file di storage
            $table->string('file_url')->nullable();                  // public URL setelah upload
            $table->string('file_lama_id')->nullable();              // ID referensi ke file lama
            $table->string('redirect_url')->nullable();              // jika pakai link

            // Cover
            $table->string('cover')->nullable();
            $table->string('cover_url')->nullable();

            // Waktu Penjualan
            $table->dateTime('waktu_mulai_jual')->nullable();
            $table->date('tanggal_kadaluarsa')->nullable();

            // Pengaturan
            $table->text('catatan')->nullable();                     // ditampilkan setelah bayar
            $table->unsignedInteger('max_pembayaran')->nullable();   // kuota/qty, null = unlimited
            $table->boolean('bisa_affiliate')->default(false);

            // Status
            $table->enum('status', ['published', 'unpublished', 'unlisted'])->default('unpublished');

            // Statistik
            $table->unsignedInteger('total_penjualan')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('tipe_pembayaran');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk_digitals');
    }
};