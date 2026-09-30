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
            $table->string('email')->nullable()->change();
            $table->string('username', 30)->nullable()->unique()->after('name');
            $table->string('role', 20)->default('student')->after('username');
            $table->string('jenjang', 10)->nullable()->index()->after('role');
            $table->string('no_hp', 30)->nullable()->after('jenjang');
            $table->string('status', 30)->default('pengisian_data')->index()->after('no_hp');
            $table->text('catatan_admin')->nullable()->after('status');
            $table->timestamp('finalized_at')->nullable()->after('catatan_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropIndex(['jenjang']);
            $table->dropIndex(['status']);
            $table->dropColumn(['username', 'role', 'jenjang', 'no_hp', 'status', 'catatan_admin', 'finalized_at']);
        });
    }
};
