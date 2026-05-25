<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produk_digitals', function (Blueprint $table) {
            // Add indexes for better query performance
            $table->index('kategori');
            $table->index('created_at');
            $table->index(['user_id', 'status']); // Composite index for common queries
        });
    }

    public function down(): void
    {
        Schema::table('produk_digitals', function (Blueprint $table) {
            $table->dropIndex(['kategori']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id', 'status']);
        });
    }
};
