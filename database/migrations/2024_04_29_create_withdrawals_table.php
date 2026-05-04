<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('jumlah', 15, 2);
            $table->string('metode_pembayaran'); // bank_transfer, ewallet, etc
            $table->string('nomor_rekening')->nullable();
            $table->string('nama_pemilik_rekening')->nullable();
            $table->string('bank_name')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->text('catatan')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('tanggal_permohonan')->useCurrent();
            $table->timestamp('tanggal_approval')->nullable();
            $table->timestamp('tanggal_selesai')->nullable();
            $table->foreignUuid('approved_by')->nullable()->references('id')->on('users')->cascadeOnDelete();
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('tanggal_permohonan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
