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
            // users.id in the ppdb2020 database, for students imported from it.
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            // Registration number carried over from ppdb2020; new students get a generated one.
            $table->string('nomor_pendaftaran', 30)->nullable();
        });

        Schema::table('form_fields', function (Blueprint $table) {
            // Stable identifier used by importers, e.g. "nisn". Admins never see it.
            $table->string('key', 64)->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('form_fields', function (Blueprint $table) {
            $table->dropIndex(['key']);
            $table->dropColumn('key');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['legacy_id']);
            $table->dropColumn(['legacy_id', 'nomor_pendaftaran']);
        });
    }
};
