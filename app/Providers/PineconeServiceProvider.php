<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Probots\Pinecone\Client as Pinecone;

class PineconeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Pinecone::class, function ($app) {
            return new Pinecone(
                config('services.pinecone.api_key'),
                config('services.pinecone.host')
            );
        });
    }
} 