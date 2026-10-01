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
        // Applicants pay before they have an account, as in ppdb2020: the
        // payment holds their details until the committee creates the account.
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            // Lets the applicant follow their submission without logging in.
            $table->string('code', 20)->nullable()->unique();
            $table->string('jenjang', 10)->nullable()->index();
            $table->foreignId('registration_period_id')->nullable()->constrained()->nullOnDelete();
            $table->string('applicant_name')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            // The new account's password, shown on the status page until the first login.
            $table->text('account_password')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropIndex(['jenjang']);
            $table->dropConstrainedForeignId('registration_period_id');
            $table->dropColumn(['code', 'jenjang', 'applicant_name', 'phone', 'email', 'account_password']);
        });
    }
};
