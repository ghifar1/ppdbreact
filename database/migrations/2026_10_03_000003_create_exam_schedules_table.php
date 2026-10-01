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
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            // Null: for every jenjang / every registration period.
            $table->string('jenjang', 10)->nullable()->index();
            $table->foreignId('registration_period_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->date('date');
            $table->string('starts_at', 5);
            $table->string('ends_at', 5)->nullable();
            $table->string('location', 150)->nullable();
            // Only for students whose participant number is in this range (a session or room).
            $table->unsignedSmallInteger('number_from')->nullable();
            $table->unsignedSmallInteger('number_to')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            // Participant number (nomor peserta), counted per jenjang and registration year.
            $table->unsignedSmallInteger('exam_number')->nullable();
            $table->unsignedSmallInteger('exam_year')->nullable();
            $table->unique(['jenjang', 'exam_year', 'exam_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['jenjang', 'exam_year', 'exam_number']);
            $table->dropColumn(['exam_number', 'exam_year']);
        });

        Schema::dropIfExists('exam_schedules');
    }
};
