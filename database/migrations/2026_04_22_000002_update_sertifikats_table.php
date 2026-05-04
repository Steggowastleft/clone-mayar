<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sertifikats', function (Blueprint $table) {
            // Tambah kolom untuk approval manual (hanya jika belum ada)
            if (!Schema::hasColumn('sertifikats', 'is_approved')) {
                $table->boolean('is_approved')->default(false)->comment('Apakah sertifikat sudah disetujui (otomatis atau manual)');
            }
            if (!Schema::hasColumn('sertifikats', 'is_manual_approved')) {
                $table->boolean('is_manual_approved')->default(false)->comment('Apakah sertifikat disetujui secara manual oleh penyelenggara');
            }
            if (!Schema::hasColumn('sertifikats', 'approved_by')) {
                $table->uuid('approved_by')->nullable()->comment('User ID penyelenggara yang approve');
                $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('sertifikats', 'approved_at')) {
                $table->dateTime('approved_at')->nullable()->comment('Waktu approval');
            }
            if (!Schema::hasColumn('sertifikats', 'approval_reason')) {
                $table->text('approval_reason')->nullable()->comment('Alasan approval manual');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sertifikats', function (Blueprint $table) {
            $table->dropColumn([
                'is_approved',
                'is_manual_approved',
                'approval_reason',
                'approved_at'
            ]);
            $table->dropForeign(['approved_by']);
            $table->dropColumn('approved_by');
        });
    }
};
