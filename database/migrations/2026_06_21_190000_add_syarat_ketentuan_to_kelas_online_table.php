<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('kelas_online', 'syarat_ketentuan')) {
            Schema::table('kelas_online', function (Blueprint $table) {
                $table->text('syarat_ketentuan')->nullable()->after('tanggal_selesai');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('kelas_online', 'syarat_ketentuan')) {
            Schema::table('kelas_online', function (Blueprint $table) {
                $table->dropColumn('syarat_ketentuan');
            });
        }
    }
};
