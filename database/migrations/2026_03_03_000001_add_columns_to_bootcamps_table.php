<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bootcamps', function (Blueprint $table) {
            // Cek dan tambah kolom yang belum ada
            if (!Schema::hasColumn('bootcamps', 'kategori')) {
                $table->string('kategori')->nullable()->after('participants');
            }
            if (!Schema::hasColumn('bootcamps', 'tipe_pembayaran')) {
                $table->string('tipe_pembayaran')->nullable()->after('kategori');
            }
            if (!Schema::hasColumn('bootcamps', 'harga')) {
                $table->decimal('harga', 15, 2)->default(0)->after('tipe_pembayaran');
            }
            if (!Schema::hasColumn('bootcamps', 'harga_coret')) {
                $table->decimal('harga_coret', 15, 2)->nullable()->after('harga');
            }
            if (!Schema::hasColumn('bootcamps', 'deskripsi')) {
                $table->text('deskripsi')->nullable()->after('harga_coret');
            }
            if (!Schema::hasColumn('bootcamps', 'instruksi')) {
                $table->text('instruksi')->nullable()->after('deskripsi');
            }
            if (!Schema::hasColumn('bootcamps', 'syarat_ketentuan')) {
                $table->text('syarat_ketentuan')->nullable()->after('instruksi');
            }
            if (!Schema::hasColumn('bootcamps', 'cover')) {
                $table->string('cover')->nullable()->after('syarat_ketentuan');
            }
            if (!Schema::hasColumn('bootcamps', 'max_peserta')) {
                $table->integer('max_peserta')->nullable()->after('cover');
            }
            if (!Schema::hasColumn('bootcamps', 'batas_nilai_quiz')) {
                $table->decimal('batas_nilai_quiz', 5, 2)->nullable()->after('max_peserta');
            }
            if (!Schema::hasColumn('bootcamps', 'redirect_url')) {
                $table->string('redirect_url')->nullable()->after('batas_nilai_quiz');
            }
            if (!Schema::hasColumn('bootcamps', 'bisa_affiliate')) {
                $table->boolean('bisa_affiliate')->default(false)->after('redirect_url');
            }
            if (!Schema::hasColumn('bootcamps', 'tanggal_mulai_jual')) {
                $table->date('tanggal_mulai_jual')->nullable()->after('bisa_affiliate');
            }
            if (!Schema::hasColumn('bootcamps', 'tanggal_tutup_daftar')) {
                $table->date('tanggal_tutup_daftar')->nullable()->after('tanggal_mulai_jual');
            }
            if (!Schema::hasColumn('bootcamps', 'tanggal_mulai_pembelajaran')) {
                $table->date('tanggal_mulai_pembelajaran')->nullable()->after('tanggal_tutup_daftar');
            }
            if (!Schema::hasColumn('bootcamps', 'tanggal_batas_pembelajaran')) {
                $table->date('tanggal_batas_pembelajaran')->nullable()->after('tanggal_mulai_pembelajaran');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bootcamps', function (Blueprint $table) {
            $table->dropColumn([
                'kategori', 'tipe_pembayaran', 'harga', 'harga_coret',
                'deskripsi', 'instruksi', 'syarat_ketentuan', 'cover',
                'max_peserta', 'batas_nilai_quiz', 'redirect_url', 'bisa_affiliate',
                'tanggal_mulai_jual', 'tanggal_tutup_daftar',
                'tanggal_mulai_pembelajaran', 'tanggal_batas_pembelajaran',
            ]);
        });
    }
};