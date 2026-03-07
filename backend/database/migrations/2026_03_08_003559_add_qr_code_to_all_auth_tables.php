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
        Schema::table('doctors', function (Blueprint $table) {
            $table->string('qr_code')->nullable()->unique()->after('password');
        });
        Schema::table('laps', function (Blueprint $table) {
            $table->string('qr_code')->nullable()->unique()->after('password');
        });
        Schema::table('pharmas', function (Blueprint $table) {
            $table->string('qr_code')->nullable()->unique()->after('password');
        });
        Schema::table('paramedics', function (Blueprint $table) {
            $table->string('qr_code')->nullable()->unique()->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn('qr_code');
        });
        Schema::table('laps', function (Blueprint $table) {
            $table->dropColumn('qr_code');
        });
        Schema::table('pharmas', function (Blueprint $table) {
            $table->dropColumn('qr_code');
        });
        Schema::table('paramedics', function (Blueprint $table) {
            $table->dropColumn('qr_code');
        });
    }
};
