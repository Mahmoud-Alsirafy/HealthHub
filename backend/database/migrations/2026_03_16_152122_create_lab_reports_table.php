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
        Schema::create('lab_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('lab_id')->nullable()->references('id')->on('labs')->onDelete('cascade');
            $table->foreignId('report_id')->nullable()->references('id')->on('doctor_reports')->onDelete('cascade');
            $table->string('test_name');          // اسم التحليل
            $table->string('status')->default('pending'); // pending / completed
            $table->text('result')->nullable();   // نتيجة التحليل
            $table->text('notes')->nullable();    // ملاحظات
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_reports');
    }
};
