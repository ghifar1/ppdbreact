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
        Schema::create('admission_settings', function (Blueprint $table) {
            $table->id();
            $table->string('jenjang', 10)->unique();
            // Registration fee in rupiah; null or 0 means registration is free.
            $table->unsignedInteger('fee')->nullable();
            $table->string('bank_name', 100)->nullable();
            $table->string('account_number', 50)->nullable();
            $table->string('account_name', 150)->nullable();
            $table->text('payment_notes')->nullable();
            // Null bounds mean no limit on that side.
            $table->dateTime('finalization_opens_at')->nullable();
            $table->dateTime('finalization_closes_at')->nullable();
            $table->dateTime('card_opens_at')->nullable();
            $table->dateTime('card_closes_at')->nullable();
            $table->dateTime('announcement_at')->nullable();
            $table->text('exam_notes')->nullable();
            $table->text('reregistration_info')->nullable();
            $table->string('headmaster_name', 150)->nullable();
            $table->string('headmaster_nip', 50)->nullable();
            $table->timestamps();
        });

        Schema::table('registration_periods', function (Blueprint $table) {
            // Overrides the jenjang's fee for students registering in this period.
            $table->unsignedInteger('fee')->nullable()->after('closes_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registration_periods', function (Blueprint $table) {
            $table->dropColumn('fee');
        });

        Schema::dropIfExists('admission_settings');
    }
};
