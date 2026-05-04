<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();
            $table->string('submission_url')->nullable();   // link file / Google Drive
            $table->text('submission_teks')->nullable();    // jawaban teks
            $table->unsignedTinyInteger('grade')->nullable(); // 0-100, null = belum dinilai
            $table->timestamp('waktu_kirim')->useCurrent();
            $table->timestamps();

            // Satu peserta hanya bisa submit sekali per assignment
            $table->unique(['assignment_id', 'peserta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};