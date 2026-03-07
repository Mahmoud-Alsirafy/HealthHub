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
        Schema::create('patient_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // البيانات الشخصية
            $table->string('phone')->nullable();
            $table->string('phone_alt')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('nationality')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('occupation')->nullable();

            // العنوان
            $table->string('governorate')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();

            // البيانات الطبية
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->text('allergies')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('previous_surgeries')->nullable();
            $table->text('family_history')->nullable();

            // جهة اتصال للطوارئ
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_profiles');
    }
};
