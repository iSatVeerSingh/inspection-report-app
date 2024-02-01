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
        Schema::create('inspection_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->boolean('active')->default(true)->index();
            $table->foreignUuid('job_id')->constrained('jobs');
            $table->foreignUuid('item_id')->nullable()->constrained('items');
            $table->json('images')->nullable();
            $table->text('note')->nullable();
            // if custom item
            $table->boolean('custom')->default(false);
            $table->string('name')->nullable();
            $table->text('openingParagraph')->nullable();
            $table->text('closingParagraph')->nullable();
            $table->text('embeddedImage')->nullable();

            // is this belongs to previous item
            $table->boolean('previousItem')->default(false);
            $table->foreignUuid('previous_item_id')->nullable()->constrained('inspection_items');
            // $table->foreignId('previous_job_id')->nullable()->constrained('jobs');
            // $table->string('summary')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_items');
    }
};
