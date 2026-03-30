<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->foreignId('peserta_id')->constrained('peserta')->cascadeOnDelete();
            $table->unsignedTinyInteger('bintang');          // 1-5
            $table->text('ulasan')->nullable();
            $table->boolean('tampil_anonim')->default(false);
            $table->string('foto_url')->nullable();          // foto custom jika diupload
            $table->timestamps();

            // Satu peserta hanya bisa rating sekali per bootcamp
            $table->unique(['bootcamp_id', 'peserta_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};