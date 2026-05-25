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
        Schema::table('ratings', function (Blueprint $table) {
            // Drop foreign key first to allow index changes
            $table->dropForeign(['bootcamp_id']);
            $table->dropUnique(['bootcamp_id', 'peserta_id']);
            
            $table->foreignId('bootcamp_id')->nullable()->change();
            
            $table->nullableMorphs('rateable'); // Adds rateable_id and rateable_type
            
            // Re-add foreign key but nullable
            $table->foreign('bootcamp_id')->references('id')->on('bootcamps')->onDelete('cascade');
            
            // Add unique constraint for polymorphic ratings
            $table->unique(['rateable_id', 'rateable_type', 'peserta_id'], 'ratings_rateable_peserta_unique');
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropUnique('ratings_rateable_peserta_unique');
            $table->dropMorphs('rateable');
            $table->foreignId('bootcamp_id')->nullable(false)->change();
            $table->unique(['bootcamp_id', 'peserta_id']);
        });
    }
};
