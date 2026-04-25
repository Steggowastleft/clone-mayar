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
        Schema::create('tulisans', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama');
            $table->string('url')->nullable();
            $table->string('tipe_tulisan')->default('one_shot');
            $table->string('tipe_pembayaran')->nullable();
            $table->string('mekanisme_bayar')->nullable();
            $table->integer('harga')->default(0);
            $table->text('deskripsi')->nullable();
            $table->string('cover')->nullable();
            $table->dateTime('tanggal_mulai_jual')->nullable();
            $table->dateTime('tanggal_kadaluarsa')->nullable();
            $table->text('catatan')->nullable();
            $table->integer('max_pembayaran')->nullable();
            $table->string('genre')->nullable();
            $table->string('author')->nullable();
            $table->string('bahasa')->nullable();
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
        Schema::dropIfExists('tulisans');
    }
};
