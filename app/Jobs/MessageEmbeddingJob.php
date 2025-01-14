<?php

namespace App\Jobs;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Probots\Pinecone\Client as Pinecone;
use OpenAI\Client as OpenAI;

class MessageEmbeddingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    const MODEL = 'text-embedding-3-small';

    public function __construct(
        public Message $message
    ) {}

    public function handle(Pinecone $pinecone, OpenAI $openai): void
    {
        $response = $openai->embeddings()->create([
            'model' => self::MODEL,
            'input' => $this->message->content,
        ]);

        $vector = $response->embeddings[0]->embedding;

        $response = $pinecone->data()->vectors()->upsert(vectors: [
            'id' => (string) $this->message->id,
            'values' => $vector,
            'metadata' => [
                'id' => $this->message->id,
                'user_id' => $this->message->user_id,
                'channel_id' => $this->message->channel_id,
            ]
        ]);

        if (!$response->successful()) {
            Log::error('Failed to store message embedding', [
                'message_id' => $this->message->id,
                'response' => $response->json()
            ]);
        }
    }
} 