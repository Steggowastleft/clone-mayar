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
        Schema::create('coaching_mentorings', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Basic Info
            $table->string('nama');
            $table->longText('deskripsi')->nullable();

            // Booking Calendar
            $table->string('booking_url'); // Calendly, Cal.com, etc
            $table->enum('tipe_pembayaran', ['berbayar', 'gratis'])->default('berbayar');

            // Pricing
            $table->integer('harga')->default(0); // Per-sesi
            $table->integer('harga_coret')->nullable();

            // Cover
            $table->string('cover')->nullable();

            // Sale Schedule
            $table->dateTime('waktu_mulai_jual')->nullable();
            $table->date('tanggal_kadaluarsa')->nullable();

            // Quota
            $table->integer('max_pembayaran')->nullable(); // unlimited if null

            // Instructions
            $table->longText('instruksi')->nullable();
            $table->longText('syarat_ketentuan')->nullable();

            // Meta
            $table->boolean('bisa_affiliate')->default(false);
            $table->enum('status', ['published', 'unpublished', 'unlisted'])->default('unpublished');
            $table->integer('total_penjualan')->default(0);

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coaching_mentorings');
    }
};
