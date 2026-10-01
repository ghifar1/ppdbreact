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
        Schema::table('users', function (Blueprint $table) {
            // Login for the external exam (e-learning/CBT) system, printed on the exam card.
            $table->string('exam_username', 50)->nullable()->unique();
            // Readable by admins and the student, stored with Laravel's "encrypted" cast.
            $table->text('exam_password')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['exam_username']);
            $table->dropColumn(['exam_username', 'exam_password']);
        });
    }
};
