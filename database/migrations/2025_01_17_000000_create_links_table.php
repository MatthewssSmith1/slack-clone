<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('src_msg_id')->constrained('messages')->cascadeOnDelete();
            $table->foreignId('tgt_msg_id')->nullable()->constrained('messages')->nullOnDelete();
            $table->integer('rank')->nullable();
            $table->string('title')->nullable();
            $table->string('tooltip')->nullable();
            $table->timestamp('tgt_created_at')->nullable();
            $table->string('attachment_path')->nullable();
            $table->string('attachment_name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('links');
    }
};
