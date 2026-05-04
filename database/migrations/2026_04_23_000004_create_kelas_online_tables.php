<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas_online', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('slug')->unique();

            // Harga & status
            $table->decimal('harga', 12, 2)->default(0);
            $table->boolean('is_gratis')->default(false);
            $table->enum('status', ['draft', 'aktif', 'selesai', 'dibatalkan'])->default('draft');

            // Konfigurasi kelas (tanpa diskusi)
            $table->boolean('require_quiz_sertifikat')->default(false);
            $table->decimal('nilai_minimum_quiz', 5, 2)->nullable();
            $table->boolean('has_assignment')->default(false);

            // Jadwal
            $table->dateTime('tanggal_mulai')->nullable();
            $table->dateTime('tanggal_selesai')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('kelas_online_sesi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_online_id')->constrained('kelas_online')->onDelete('cascade');
            $table->enum('tipe', ['awal', 'tengah', 'akhir']);
            $table->string('judul');
            $table->boolean('is_aktif')->default(false);
            $table->dateTime('dibuka_pada')->nullable();
            $table->dateTime('ditutup_pada')->nullable();
            $table->timestamps();

            $table->unique(['kelas_online_id', 'tipe']);
        });

        Schema::create('kelas_online_peserta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_online_id')->constrained('kelas_online')->onDelete('cascade');
            $table->foreignId('peserta_id')->constrained('peserta')->onDelete('cascade');
            $table->enum('status', ['aktif', 'selesai', 'dibatalkan'])->default('aktif');
            $table->timestamp('mendaftar_pada')->useCurrent();
            $table->timestamps();

            $table->unique(['kelas_online_id', 'peserta_id']);
        });

        Schema::create('kelas_online_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_online_id')->constrained('kelas_online')->onDelete('cascade');
            $table->foreignId('sesi_id')->constrained('kelas_online_sesi')->onDelete('cascade');
            $table->foreignId('peserta_id')->constrained('peserta')->onDelete('cascade');
            $table->enum('attendance_type', ['awal', 'tengah', 'akhir']);
            $table->string('file_bukti');
            $table->string('file_nama_asli');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('keterangan')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();

            $table->unique(['sesi_id', 'peserta_id']);
        });

        Schema::create('kelas_online_sertifikats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kelas_online_id')->constrained('kelas_online')->onDelete('cascade');
            $table->foreignId('peserta_id')->constrained('peserta')->onDelete('cascade');
            $table->enum('status', [
                'not_eligible', 'pending', 'approved', 'manual_approved', 'rejected',
            ])->default('not_eligible');
            $table->string('nomor_sertifikat')->nullable()->unique();
            $table->string('qr_token')->nullable()->unique();
            $table->string('file_sertifikat')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
            $table->boolean('is_manual_approved')->default(false);
            $table->timestamp('approved_at')->nullable();
            $table->text('catatan_approval')->nullable();
            $table->timestamps();

            $table->unique(['kelas_online_id', 'peserta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas_online_sertifikats');
        Schema::dropIfExists('kelas_online_attendances');
        Schema::dropIfExists('kelas_online_peserta');
        Schema::dropIfExists('kelas_online_sesi');
        Schema::dropIfExists('kelas_online');
    }
};