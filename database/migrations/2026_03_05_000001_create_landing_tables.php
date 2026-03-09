<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel instruktur
        Schema::create('instruktur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('nama');
            $table->string('jabatan')->nullable();
            $table->text('bio')->nullable();
            $table->string('foto')->nullable();        // path storage
            $table->unsignedInteger('urutan')->default(1);
            $table->timestamps();
        });

        // Tabel landing_contents (silabus, cocok_untuk, outcome, faq)
        // Satu baris per section per bootcamp — konten disimpan sebagai JSON
        Schema::create('landing_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('section');     // silabus | cocok_untuk | outcome | faq
            $table->longText('konten');    // JSON array
            $table->timestamps();

            // Satu section unik per bootcamp
            $table->unique(['bootcamp_id', 'section']);
        });

        // Tabel testimoni
        Schema::create('testimoni', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('nama');
            $table->string('profesi')->nullable();
            $table->text('isi');
            $table->unsignedTinyInteger('rating')->default(5); // 1-5
            $table->unsignedInteger('urutan')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('testimoni');
        Schema::dropIfExists('landing_contents');
        Schema::dropIfExists('instruktur');
    }
};