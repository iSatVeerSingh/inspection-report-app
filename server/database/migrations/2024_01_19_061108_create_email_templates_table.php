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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('active')->default(true)->index();
            $table->string('name')->unique();
            $table->string('subject');
            $table->text('body');
            $table->enum('cctypes', ['Builder', 'Supervisor'])->nullable();
            $table->enum('condition', ['After Any Job', 'Job Category']);
            $table->foreignUuid('job_category_id')->nullable()->constrained('job_categories');
            $table->string('delay')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
