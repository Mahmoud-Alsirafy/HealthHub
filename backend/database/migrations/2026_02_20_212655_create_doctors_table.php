<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();

            // Auth
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('code')->nullable();
            $table->datetime('expired_at')->nullable();
            $table->string('qr_code', 64)->nullable()->unique();
            $table->foreignId('admin_id')->references('id')->on('admins')->onDelete('cascade');

            // بيانات شخصية
            $table->string('phone')->nullable();
            $table->string('national_id')->nullable()->unique();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();

            // بيانات مهنية
            $table->string('specialty')->nullable();        // تخصص: Cardiologist
            $table->string('facility')->nullable();         // المستشفى: Cairo University Hospital
            $table->string('department')->nullable();       // القسم: Cardiology
            $table->string('license_number')->nullable();   // رقم الترخيص
            $table->integer('experience_years')->nullable(); // سنوات الخبرة

            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
