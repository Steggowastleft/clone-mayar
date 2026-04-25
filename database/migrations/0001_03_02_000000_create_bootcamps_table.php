<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bootcamps', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->index();
            $table->string('name');
            $table->string('batch')->default('Batch 1');
            $table->enum('status', ['published', 'unpublished', 'unlisted'])->default('unpublished');
            $table->string('date')->nullable();
            $table->integer('participants')->default(0);

            // Form fields
            $table->string('kategori')->nullable();
            $table->string('tipe_pembayaran')->nullable();
            $table->decimal('harga', 15, 2)->default(0);
            $table->decimal('harga_coret', 15, 2)->nullable();
            $table->text('deskripsi')->nullable();
            $table->text('instruksi')->nullable();
            $table->text('syarat_ketentuan')->nullable();
            $table->string('cover')->nullable();
            $table->integer('max_peserta')->nullable();
            $table->decimal('batas_nilai_quiz', 5, 2)->nullable();
            $table->string('redirect_url')->nullable();
            $table->boolean('bisa_affiliate')->default(false);

            // Tanggal
            $table->date('tanggal_mulai_jual')->nullable();
            $table->date('tanggal_tutup_daftar')->nullable();
            $table->date('tanggal_mulai_pembelajaran')->nullable();
            $table->date('tanggal_batas_pembelajaran')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bootcamps');
    }
};