<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel babs (section / bab)
        Schema::create('babs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->unsignedInteger('urutan')->default(1);
            $table->timestamps();
        });

        // Tabel materis (isi tiap bab)
        Schema::create('materis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bab_id')->constrained('babs')->cascadeOnDelete();
            $table->string('judul');
            $table->enum('tipe', ['video', 'dokumen', 'link', 'teks'])->default('teks');
            $table->text('konten')->nullable();
            $table->string('durasi', 20)->nullable(); // contoh: "10:30"
            $table->unsignedInteger('urutan')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materis');
        Schema::dropIfExists('babs');
    }
};