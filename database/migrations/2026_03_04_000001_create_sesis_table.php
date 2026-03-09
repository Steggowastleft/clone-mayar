<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_online')->default(false);
            $table->string('link_sesi', 500)->nullable();
            $table->string('lokasi', 500)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('nama_pemateri')->nullable();
            $table->text('profil_pemateri')->nullable();
            $table->dateTime('waktu_mulai')->nullable();
            $table->dateTime('waktu_selesai')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesis');
    }
};