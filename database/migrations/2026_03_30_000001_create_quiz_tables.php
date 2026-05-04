<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah tipe ke assignments
        Schema::table('assignments', function (Blueprint $table) {
            $table->enum('tipe', ['upload', 'quiz'])->default('upload')->after('judul');
        });

        // Tabel soal
        Schema::create('soals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->text('pertanyaan');
            $table->enum('tipe_soal', ['pilihan_ganda', 'essay'])->default('pilihan_ganda');
            $table->json('pilihan')->nullable();   // ["A. ...", "B. ...", "C. ...", "D. ..."]
            $table->string('jawaban_benar')->nullable(); // "A", "B", dll — null untuk essay
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        // Tabel hasil quiz (per attempt)
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();
            $table->json('jawaban');        // {"soal_id": "jawaban_peserta", ...}
            $table->unsignedTinyInteger('nilai'); // 0-100
            $table->timestamp('dikerjakan_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('soals');
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn('tipe');
        });
    }
};