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
        Schema::table('babs', function (Blueprint $table) {
            $table->foreignId('bootcamp_id')->nullable()->change();
            $table->foreignId('kelas_online_id')->nullable()->after('bootcamp_id')->constrained('kelas_online')->cascadeOnDelete();
        });

        Schema::table('instruktur', function (Blueprint $table) {
            $table->foreignId('bootcamp_id')->nullable()->change();
            $table->foreignId('kelas_online_id')->nullable()->after('bootcamp_id')->constrained('kelas_online')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instruktur', function (Blueprint $table) {
            $table->dropForeign(['kelas_online_id']);
            $table->dropColumn('kelas_online_id');
            // If there's existing data that is null, reverting this might fail if we don't handle it.
            // But for now, we'll just try to change it back.
            $table->foreignId('bootcamp_id')->nullable(false)->change();
        });

        Schema::table('babs', function (Blueprint $table) {
            $table->dropForeign(['kelas_online_id']);
            $table->dropColumn('kelas_online_id');
            $table->foreignId('bootcamp_id')->nullable(false)->change();
        });
    }
};
