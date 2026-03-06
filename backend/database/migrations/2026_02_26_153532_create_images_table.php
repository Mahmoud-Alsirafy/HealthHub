<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('images', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->integer('imageable_id');
            $table->string('imageable_type');

            // ✅ أضفهم هنا
            $table->enum('type', [
                'xray',
                'lab_result',
                'prescription',
                'medical_report',
                'vaccine'
            ])->nullable();
            $table->string('title')->nullable();
            $table->text('notes')->nullable();
            $table->date('date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropColumn(['type', 'title', 'notes', 'date']);
        });
    }
};
