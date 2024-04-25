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
        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('job_id')->constrained('jobs');
            $table->foreignUuid('customer_id')->constrained('customers');
            $table->foreignUuid('original_report_id')->nullable()->constrained('reports');
            $table->foreignUuid('revised_report_id')->nullable()->constrained('reports');
            $table->boolean('is_revised')->default(false)->index();
            $table->json('notes')->nullable();
            $table->text('recommendation')->nullable();
            $table->dateTime('completed_at')->nullable();
            // $table->longText('pdf')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
