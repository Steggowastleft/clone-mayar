<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('webinars', function (Blueprint $table) {
            $table->id();

            // BASIC INFO
            $table->uuid('user_id')->index();
            $table->string('nama');
            $table->text('deskripsi')->nullable();

            // URL webinar (zoom/google meet/youtube)
            $table->string('url')->nullable();

            // PRICING
            $table->integer('harga')->default(0);
            $table->integer('harga_coret')->nullable();

            // STATUS
            $table->enum('status', ['published', 'unpublished', 'unlisted'])
                  ->default('unpublished');

            // METRICS
            $table->integer('peserta')->default(0);
            $table->integer('max_peserta')->nullable();

            // SCHEDULE
            $table->dateTime('tanggal_mulai')->nullable();
            $table->dateTime('tanggal_selesai')->nullable();
            $table->string('timezone')->default('Asia/Jakarta');

            // SALES CONTROL
            $table->dateTime('tanggal_mulai_jual')->nullable();
            $table->dateTime('tanggal_tutup_daftar')->nullable();

            // CONTENT AFTER PURCHASE
            $table->text('instruksi')->nullable();
            $table->text('syarat_ketentuan')->nullable();

            // REDIRECT AFTER PAYMENT
            $table->string('redirect_url')->nullable();

            // AFFILIATE SYSTEM
            $table->boolean('affiliate_enabled')->default(false);

            // MEDIA
            $table->string('cover')->nullable();

            $table->timestamps();

            // INDEX biar cepat (important kalau data banyak)
            $table->index(['status', 'tanggal_mulai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webinars');
    }
};