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
        Schema::create('registration_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            // Null: the period applies to every jenjang.
            $table->string('jenjang', 10)->nullable()->index();
            $table->dateTime('opens_at');
            $table->dateTime('closes_at');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('registration_period_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('registration_period_id');
        });

        Schema::dropIfExists('registration_periods');
    }
};
