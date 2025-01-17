<?php

namespace App\Providers;

use OpenAI;
use Probots\Pinecone;
use Illuminate\Support\Facades\{Vite, URL};
use Illuminate\Support\ServiceProvider;
use App\Services\AssistantService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AssistantService::class, function ($app) {
            return new AssistantService(
                $app->make(OpenAI\Client::class),
                $app->make(Pinecone\Client::class)
            );
        });
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
