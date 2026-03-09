<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Tabel kustom_forms ─────────────────────────────────
        // Menyimpan konfigurasi form isian per bootcamp
        Schema::create('kustom_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('fields')->nullable();   // array konfigurasi field
            $table->boolean('is_applied')->default(false);
            $table->timestamps();
        });

        // ── Tabel peserta ──────────────────────────────────────
        // User peserta/pembeli, terpisah dari tabel users (admin)
        Schema::create('peserta', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('no_hp', 20)->nullable();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('foto')->nullable();
            $table->string('remember_token', 100)->nullable();
            $table->timestamps();
        });

        // ── Tabel pendaftaran ──────────────────────────────────
        // Relasi peserta <-> bootcamp + data form isian dinamis
        Schema::create('pendaftaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();
            $table->string('status')->default('pending'); // pending|paid|active|expired
            $table->json('form_data')->nullable();         // jawaban form isian kustom
            $table->decimal('harga_bayar', 12, 2)->default(0);
            $table->timestamp('tanggal_daftar')->useCurrent();
            $table->timestamp('tanggal_aktif')->nullable();
            $table->timestamp('tanggal_expired')->nullable();
            $table->timestamps();

            $table->unique(['bootcamp_id', 'peserta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendaftaran');
        Schema::dropIfExists('peserta');
        Schema::dropIfExists('kustom_forms');
    }
};