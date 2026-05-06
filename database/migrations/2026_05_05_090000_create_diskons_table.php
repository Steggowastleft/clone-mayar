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
        Schema::create('diskons', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama');
            $table->enum('untuk_produk', ['semua', 'pilih'])->default('semua');
            $table->json('produk_ids')->nullable(); // Array of selected product IDs when untuk_produk = 'pilih'
            $table->enum('tipe_diskon', ['persentase', 'nominal'])->default('persentase');
            $table->decimal('besaran', 12, 2);
            $table->decimal('minimum_pembelian', 12, 2)->nullable();
            $table->enum('tipe_kupon', ['berulang', 'sekali'])->default('berulang');
            $table->enum('untuk_pelanggan', ['semua', 'pilih'])->default('semua');
            $table->string('kode_kupon')->unique();
            $table->integer('batas_pemakaian')->nullable(); // Null = unlimited
            $table->timestamp('waktu_mulai')->nullable();
            $table->timestamp('tanggal_kadaluarsa')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->integer('jumlah_dipakai')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diskons');
    }
};
