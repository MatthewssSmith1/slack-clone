<?php

namespace App\Providers;

use OpenAI\Client;
use OpenAI;
use Illuminate\Support\ServiceProvider;

class OpenAIServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(Client::class, function ($app) {
            return OpenAI::client(config('services.openai.api_key'));
        });
    }
}