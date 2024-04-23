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
        Schema::create('jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('job_number')->unique();
            $table->foreignUuid('category_id')->nullable()->constrained('job_categories');
            $table->foreignUuid('customer_id')->constrained('customers');
            $table->foreignUuid('inspector_id')->nullable()->constrained('users');
            $table->dateTime('starts_at')->nullable();
            $table->string('site_address');
            $table->string('status')->index();
            $table->dateTime('completed_at')->nullable()->index();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
