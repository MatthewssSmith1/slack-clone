<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use OpenAI;

class OpenAIServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(OpenAI\Client::class, function ($app) {
            return OpenAI::client(config('services.openai.api_key'));
        });
    }
} 