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
        Schema::create('model_versions', function (Blueprint $table) {
            $table->id();
            $table->string('versionable_type');
            $table->unsignedBigInteger('versionable_id');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('version_number')->default(1);
            $table->string('event')->default('updated'); // created, updated, rollback, manual_snapshot
            $table->string('summary')->nullable();
            $table->json('changes')->nullable();
            $table->json('snapshot');
            $table->timestamps();

            $table->index(['versionable_type', 'versionable_id'], 'model_versions_subject_idx');
            $table->index(['versionable_type', 'versionable_id', 'version_number'], 'model_versions_number_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_versions');
    }
};
