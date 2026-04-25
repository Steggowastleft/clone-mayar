<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();

            // Informasi Dasar
            $table->string('nama', 100);
            $table->text('deskripsi');
            $table->enum('tipe', ['online', 'offline'])->default('online');
            $table->string('lokasi', 300)->nullable();
            $table->string('lokasi_map')->nullable();

            // Cover
            $table->string('cover')->nullable();  // path file
            $table->string('cover_url')->nullable(); // URL publik

            // Waktu Event
            $table->dateTime('waktu_mulai');
            $table->dateTime('waktu_selesai')->nullable();

            // Penjualan & Pendaftaran
            $table->dateTime('waktu_mulai_jual')->nullable();
            $table->date('tanggal_tutup_daftar')->nullable();
            $table->unsignedTinyInteger('max_tiket_per_transaksi')->default(1);

            // Instruksi & S&K
            $table->text('instruksi')->nullable();
            $table->text('syarat_ketentuan')->nullable();

            // Redirect & Affiliate
            $table->string('redirect_url')->nullable();
            $table->boolean('bisa_affiliate')->default(false);

            // Status
            $table->enum('status', ['published', 'unpublished', 'unlisted'])
                  ->default('unpublished');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('waktu_mulai');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};