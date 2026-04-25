<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tambah is_tugas_akhir ke assignments
        Schema::table('assignments', function (Blueprint $table) {
            $table->boolean('is_tugas_akhir')->default(false)->after('is_wajib');
        });

        // Tambah relasi assignment ke materis (tugas wajib per materi)
        Schema::table('materis', function (Blueprint $table) {
            $table->foreignId('assignment_id')
                  ->nullable()
                  ->after('urutan')
                  ->constrained('assignments')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('materis', function (Blueprint $table) {
            $table->dropForeign(['assignment_id']);
            $table->dropColumn('assignment_id');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn('is_tugas_akhir');
        });
    }
};