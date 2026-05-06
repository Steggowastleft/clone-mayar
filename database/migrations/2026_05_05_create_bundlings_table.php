<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundlings', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nama');
            $table->decimal('harga', 15, 2);
            $table->decimal('harga_coret', 15, 2)->nullable(); // harga strikethrough
            $table->string('cover')->nullable();
            $table->longText('deskripsi')->nullable();
            $table->enum('tipe_pembayaran', ['gratis', 'berbayar', 'bayar_semaunya'])->default('berbayar');
            $table->timestamp('tanggal_kadaluarsa')->nullable();
            $table->text('pesan_setelah_bayar')->nullable();
            $table->integer('maksimal_pembayaran')->nullable(); // null = unlimited
            $table->string('redirect_url')->nullable();
            $table->enum('status', ['published', 'unpublished'])->default('unpublished');
            $table->boolean('bisa_affiliate')->default(false);
            $table->integer('jumlah_terjual')->default(0);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundlings');
    }
};
