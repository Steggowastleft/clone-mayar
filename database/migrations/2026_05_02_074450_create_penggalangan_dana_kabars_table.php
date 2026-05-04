<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('penggalangan_dana_kabars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('penggalangan_dana_id')->constrained('penggalangan_danas')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penggalangan_dana_kabars');
    }
};
