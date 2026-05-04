<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('sesis')->cascadeOnDelete();
            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();
            $table->enum('attendance_type', ['awal', 'tengah', 'akhir']); // Tipe presensi
            $table->string('file_bukti')->nullable(); // Path ke file bukti
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // Status validasi
            $table->text('keterangan')->nullable(); // Catatan jika ditolak
            $table->timestamps();

            // Ensure satu peserta hanya bisa submit presensi tipe yang sama satu kali per sesi
            $table->unique(['sesi_id', 'peserta_id', 'attendance_type']);
            $table->index(['sesi_id', 'peserta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
