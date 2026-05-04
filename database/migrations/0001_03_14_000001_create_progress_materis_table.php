<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progress_materis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();
            $table->foreignId('materi_id')->constrained('materis')->cascadeOnDelete();
            $table->foreignId('bootcamp_id')->constrained('bootcamps')->cascadeOnDelete();
            $table->timestamp('dibaca_at')->useCurrent();
            $table->timestamps();

            // Satu peserta hanya bisa tandai sekali per materi
            $table->unique(['peserta_id', 'materi_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_materis');
    }
};