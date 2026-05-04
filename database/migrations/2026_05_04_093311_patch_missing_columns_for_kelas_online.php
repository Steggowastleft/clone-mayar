<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('bootcamps', 'user_id')) {
            Schema::table('bootcamps', function (Blueprint $table) {
                $table->uuid('user_id')->nullable()->after('id')->index();
            });

            $firstUser = DB::table('users')->first();
            if ($firstUser) {
                DB::table('bootcamps')->whereNull('user_id')->update(['user_id' => $firstUser->id]);
            }
        }

        if (!Schema::hasColumn('pendaftaran', 'registrable_id') && Schema::hasColumn('pendaftaran', 'bootcamp_id')) {
            Schema::table('pendaftaran', function (Blueprint $table) {
                $table->string('registrable_type')->nullable()->after('peserta_id');
                $table->unsignedBigInteger('registrable_id')->nullable()->after('registrable_type');
            });

            DB::table('pendaftaran')->update([
                'registrable_type' => 'App\\\\Models\\\\Bootcamp',
                'registrable_id' => DB::raw('bootcamp_id')
            ]);

            Schema::table('pendaftaran', function (Blueprint $table) {
                $table->index(['registrable_type', 'registrable_id']);
            });

            try {
                Schema::table('pendaftaran', function (Blueprint $table) {
                    $table->dropForeign(['bootcamp_id']);
                });
            } catch (\Exception $e) {}

            try {
                Schema::table('pendaftaran', function (Blueprint $table) {
                    $table->dropUnique(['bootcamp_id', 'peserta_id']);
                });
            } catch (\Exception $e) {}

            Schema::table('pendaftaran', function (Blueprint $table) {
                $table->dropColumn('bootcamp_id');
                $table->unique(['peserta_id', 'registrable_id', 'registrable_type'], 'pendaftaran_peserta_registrable_unique');
            });
        }
    }

    public function down(): void
    {
        // 
    }
};