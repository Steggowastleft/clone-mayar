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
        Schema::create('account_verifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('user_id');
            $table->string('verification_type');
            $table->string('legal_name')->nullable();
            $table->string('id_number')->nullable();
            $table->string('business_name')->nullable();
            $table->text('business_description')->nullable();
            $table->text('business_address')->nullable();
            $table->string('website')->nullable();
            $table->string('status')->default('unverified')->index();
            $table->text('decline_reason')->nullable();
            $table->string('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_verifications');
    }
};
