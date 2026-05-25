<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Use raw SQL to avoid requiring doctrine/dbal for column type changes.
        DB::statement('ALTER TABLE `model_has_roles` MODIFY `model_id` VARCHAR(191) NOT NULL');
    }

    public function down(): void
    {
        // Revert to unsigned big integer (may fail if UUIDs present).
        DB::statement('ALTER TABLE `model_has_roles` MODIFY `model_id` BIGINT UNSIGNED NOT NULL');
    }
};
