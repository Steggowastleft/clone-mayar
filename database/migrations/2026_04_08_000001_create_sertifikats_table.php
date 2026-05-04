<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sertifikats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('nomor_sertifikat')->unique(); // e.g. CERT-2024-ABC123
            $table->string('nama_peserta');
            $table->string('nama_bootcamp');
            $table->string('nama_instruktur')->nullable();
            $table->date('tanggal_selesai');
            $table->string('qr_token', 64)->unique(); // untuk verifikasi URL
            $table->timestamps();

            $table->unique(['peserta_id', 'bootcamp_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sertifikats');
    }
};