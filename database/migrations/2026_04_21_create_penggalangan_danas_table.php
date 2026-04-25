<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('penggalangan_danas', function (Blueprint $table) {
            $table->id();

            // BASIC INFO
            $table->uuid('user_id')->index();
            $table->enum('tipe', ['donasi', 'qurban', 'wakaf'])->default('donasi');
            $table->string('nama');
            $table->text('deskripsi')->nullable();

            // KATEGORI (untuk donasi)
            $table->string('kategori')->nullable();

            // HEWAN QURBAN (untuk qurban)
            $table->string('jenis_hewan')->nullable(); // sapi, kambing, ayam, dsb

            // PRICING
            $table->bigInteger('harga')->default(0); // untuk donasi = target, qurban = harga per ekor
            $table->bigInteger('harga_coret')->nullable(); // harga promo/diskon
            $table->bigInteger('minimal_donasi')->nullable(); // minimal donasi untuk donasi saja

            // UNTUK QURBAN - STOCK
            $table->integer('stok')->nullable(); // jumlah ekor tersedia

            // STATUS
            $table->enum('status', ['published', 'unpublished', 'unlisted'])
                  ->default('unpublished');

            // METRICS
            $table->bigInteger('terkumpul')->default(0); // jumlah dana terkumpul
            $table->integer('pembeli')->default(0); // jumlah pembeli/penerima

            // SCHEDULE
            $table->dateTime('tanggal_mulai_jual')->nullable();
            $table->dateTime('tanggal_tutup')->nullable();

            // CONTENT
            $table->text('tujuan')->nullable(); // tujuan penggalangan
            $table->text('penerima_manfaat')->nullable(); // penerima manfaat
            $table->text('rincian_penggunaan')->nullable(); // rincian penggunaan dana

            // CATATAN KHUSUS (akan dilihat pembeli setelah membayar)
            $table->text('catatan')->nullable();

            // REDIRECT AFTER PAYMENT
            $table->string('redirect_url')->nullable();

            // OPTIONS
            $table->boolean('tampilkan_target')->default(true);
            $table->boolean('tampilkan_pencairan')->default(false);

            // AFFILIATE SYSTEM
            $table->boolean('affiliate_enabled')->default(false);

            // MEDIA
            $table->string('cover')->nullable();

            $table->timestamps();

            // INDEX biar cepat
            $table->index(['status', 'tipe']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penggalangan_danas');
    }
};
