<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bundling_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bundling_id')->constrained('bundlings')->cascadeOnDelete();
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
