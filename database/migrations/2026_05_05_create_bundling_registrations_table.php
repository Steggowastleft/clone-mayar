<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundling_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bundling_id')->constrained('bundlings')->cascadeOnDelete();
            $table->foreignUuid('peserta_id')->constrained('users')->cascadeOnDelete();
            $table->string('nama');
            $table->string('email');
            $table->string('no_wa')->nullable();
            $table->json('custom_fields')->nullable();
            $table->enum('status_pembayaran', ['pending', 'paid', 'failed'])->default('pending');
            $table->decimal('harga', 15, 2);
            $table->timestamp('tanggal_pembayaran')->nullable();
            $table->string('referral_code')->nullable();
            $table->timestamps();
            
            $table->index('bundling_id');
            $table->index('peserta_id');
            $table->index('status_pembayaran');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundling_registrations');
    }
};
