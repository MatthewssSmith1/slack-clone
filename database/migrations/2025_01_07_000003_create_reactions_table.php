<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->string('emoji_code');
            $table->timestamps();

            $table->unique(['user_id', 'message_id', 'emoji_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
}; 