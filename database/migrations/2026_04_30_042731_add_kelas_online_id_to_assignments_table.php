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
        Schema::table('assignments', function (Blueprint $table) {
            $table->foreignId('kelas_online_id')->nullable()->after('bootcamp_id')->constrained('kelas_online')->onDelete('cascade');
            $table->foreignId('bootcamp_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['kelas_online_id']);
            $table->dropColumn('kelas_online_id');
        });
    }
};
