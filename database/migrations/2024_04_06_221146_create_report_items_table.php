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
        Schema::create('report_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('item_id')->nullable()->constrained('items');
            $table->foreignUuid('report_id')->constrained('reports');
            $table->string('name');
            $table->json('images')->nullable();
            $table->text('note')->nullable();
            $table->integer('height', false, true)->default(0);
            $table->foreignUuid('previous_report_item_id')->nullable()->constrained('report_items');

            $table->text('opening_paragraph')->nullable();
            $table->text('closing_paragraph')->nullable();
            $table->longText('embedded_image')->nullable();
            $table->foreignUuid('original_report_item_id')->nullable()->constrained('report_items');
            $table->boolean('is_revised')->default(false)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_items');
    }
};
