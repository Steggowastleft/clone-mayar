<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // kustom_forms
        Schema::create('kustom_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('fields')->nullable();
            $table->boolean('is_applied')->default(false);
            $table->timestamps();
        });

        // peserta
        Schema::create('peserta', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('no_hp', 20)->nullable();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('foto')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // 🔥 pendaftaran polymorphic
        Schema::create('pendaftaran', function (Blueprint $table) {
            $table->id();

            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();

            $table->morphs('registrable');

            $table->string('status')->default('pending');
            $table->json('form_data')->nullable();
            $table->decimal('harga_bayar', 12, 2)->default(0);

            $table->timestamp('tanggal_daftar')->useCurrent();
            $table->timestamp('tanggal_aktif')->nullable();
            $table->timestamp('tanggal_expired')->nullable();

            $table->timestamps();

            $table->unique(['peserta_id', 'registrable_id', 'registrable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pendaftaran');
        Schema::dropIfExists('peserta');
        Schema::dropIfExists('kustom_forms');
    }
};