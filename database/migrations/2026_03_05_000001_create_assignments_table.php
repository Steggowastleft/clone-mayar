<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('judul');
            $table->longText('tugas'); // HTML dari rich text editor
            $table->boolean('is_wajib')->default(false);
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_akhir')->nullable();
            $table->timestamps();
        });

        Schema::create('assignment_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->string('name');        // nama asli file
            $table->string('path');        // path di storage
            $table->unsignedBigInteger('size')->nullable(); // bytes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_files');
        Schema::dropIfExists('assignments');
    }
};