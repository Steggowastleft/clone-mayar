<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('bundling_items');
        Schema::create('bundling_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('bundling_id');
            $table->foreign('bundling_id')
                ->references('id')
                ->on('bundlings')
                ->cascadeOnDelete();
            $table->morphs('itemable'); // product_id & product_type
            $table->timestamps();
            
            $table->unique(['bundling_id', 'itemable_id', 'itemable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bundling_items');
    }
};
