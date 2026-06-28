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
        Schema::table('pendaftaran', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('snap_token');
        });
        Schema::table('kelas_online_peserta', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('snap_token');
        });
        Schema::table('pembayarans', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('confirmed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran', function (Blueprint $table) {
            $table->dropColumn('coupon_code');
        });
        Schema::table('kelas_online_peserta', function (Blueprint $table) {
            $table->dropColumn('coupon_code');
        });
        Schema::table('pembayarans', function (Blueprint $table) {
            $table->dropColumn('coupon_code');
        });
    }
};
