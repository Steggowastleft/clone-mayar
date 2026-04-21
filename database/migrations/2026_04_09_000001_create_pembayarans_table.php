<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bootcamp_id')->constrained()->cascadeOnDelete();
            $table->string('nama_pembeli');
            $table->string('email_pembeli');
            $table->string('no_hp_pembeli')->nullable();
            $table->decimal('jumlah', 15, 2);
            $table->string('bukti_transfer')->nullable(); // path storage
            $table->text('catatan')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->string('order_id')->unique();
            $table->foreignId('peserta_id')->nullable()->constrained('peserta')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayarans');
    }
};