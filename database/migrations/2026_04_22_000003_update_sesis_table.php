<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sesis', function (Blueprint $table) {
            // Tambah kolom untuk penyelenggara kelas
            if (!Schema::hasColumn('sesis', 'owner_id')) {
                $table->uuid('owner_id')->nullable()->after('bootcamp_id')->comment('Penyelenggara kelas yang membuat sesi');
                $table->foreign('owner_id')->references('id')->on('users')->nullOnDelete();
            }
            
            // Tambah kolom untuk konfigurasi presensi dan assignment
            if (!Schema::hasColumn('sesis', 'require_attendance')) {
                $table->boolean('require_attendance')->default(true)->comment('Apakah presensi wajib');
            }
            if (!Schema::hasColumn('sesis', 'has_assignment')) {
                $table->boolean('has_assignment')->default(false)->comment('Apakah ada assignment/quiz');
            }
            if (!Schema::hasColumn('sesis', 'assignment_required_for_cert')) {
                $table->boolean('assignment_required_for_cert')->default(false)->comment('Apakah nilai assignment wajib untuk sertifikat');
            }
            if (!Schema::hasColumn('sesis', 'min_assignment_score')) {
                $table->integer('min_assignment_score')->default(0)->comment('Nilai minimum assignment untuk lulus (0 jika opsional)');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sesis', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropColumn([
                'owner_id',
                'require_attendance',
                'has_assignment',
                'assignment_required_for_cert',
                'min_assignment_score'
            ]);
        });
    }
};
