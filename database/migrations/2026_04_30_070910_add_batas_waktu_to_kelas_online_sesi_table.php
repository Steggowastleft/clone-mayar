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
        Schema::table('kelas_online_sesi', function (Blueprint $table) {
            $table->dateTime('batas_waktu')->nullable()->after('dibuka_pada');
        });

        Schema::table('kelas_online_attendances', function (Blueprint $table) {
            $table->boolean('is_late')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kelas_online_sesi', function (Blueprint $table) {
            $table->dropColumn('batas_waktu');
        });

        Schema::table('kelas_online_attendances', function (Blueprint $table) {
            $table->dropColumn('is_late');
        });
    }
};
