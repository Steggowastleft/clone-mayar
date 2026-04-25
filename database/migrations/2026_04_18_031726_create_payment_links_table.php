<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_links', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');

            // Info utama
            $table->string('nama');
            $table->unsignedBigInteger('harga');
            $table->unsignedBigInteger('harga_coret')->nullable();
            $table->text('deskripsi');
            $table->string('cover')->nullable();        // path file
            $table->string('cover_url')->nullable();    // URL publik

            // Pengaturan waktu
            $table->dateTime('waktu_mulai_jual')->nullable();
            $table->date('tanggal_kadaluarsa')->nullable();

            // Pengaturan lain
            $table->text('pesan_setelah_bayar')->nullable();
            $table->unsignedInteger('maksimum_pembayaran')->nullable(); // null = unlimited
            $table->string('redirect_url')->nullable();
            $table->boolean('bisa_affiliate')->default(false);

            // Status
            $table->enum('status', ['published', 'unpublished', 'unlisted'])->default('published');

            // Slug unik untuk URL publik
            $table->string('slug')->unique();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_links');
    }
};