<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE kelas_online MODIFY status VARCHAR(255) DEFAULT 'unpublished'");
        
        DB::table('kelas_online')->where('status', 'draft')->update(['status' => 'unpublished']);
        DB::table('kelas_online')->where('status', 'aktif')->update(['status' => 'published']);
        DB::table('kelas_online')->where('status', 'selesai')->update(['status' => 'unlisted']);
        DB::table('kelas_online')->where('status', 'dibatalkan')->update(['status' => 'unlisted']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('kelas_online')->where('status', 'unpublished')->update(['status' => 'draft']);
        DB::table('kelas_online')->where('status', 'published')->update(['status' => 'aktif']);
        DB::table('kelas_online')->where('status', 'unlisted')->update(['status' => 'selesai']);

        DB::statement("ALTER TABLE kelas_online MODIFY status ENUM('draft', 'aktif', 'selesai', 'dibatalkan') DEFAULT 'draft'");
    }
};
