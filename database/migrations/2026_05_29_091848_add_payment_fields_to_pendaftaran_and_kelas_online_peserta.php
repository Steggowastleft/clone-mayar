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
        // 1. Add fields to 'pendaftaran'
        Schema::table('pendaftaran', function (Blueprint $table) {
            if (!Schema::hasColumn('pendaftaran', 'order_id')) {
                $table->string('order_id')->nullable()->unique()->after('peserta_id');
            }
            if (!Schema::hasColumn('pendaftaran', 'snap_token')) {
                $table->text('snap_token')->nullable()->after('order_id');
            }
        });

        // 2. Add fields and alter status in 'kelas_online_peserta'
        Schema::table('kelas_online_peserta', function (Blueprint $table) {
            if (!Schema::hasColumn('kelas_online_peserta', 'order_id')) {
                $table->string('order_id')->nullable()->unique()->after('peserta_id');
            }
            if (!Schema::hasColumn('kelas_online_peserta', 'snap_token')) {
                $table->text('snap_token')->nullable()->after('order_id');
            }
            
            $table->string('status', 50)->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran', function (Blueprint $table) {
            $table->dropColumn(['order_id', 'snap_token']);
        });

        Schema::table('kelas_online_peserta', function (Blueprint $table) {
            $table->dropColumn(['order_id', 'snap_token']);
        });
    }
};
