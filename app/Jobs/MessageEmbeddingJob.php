<?php

namespace App\Jobs;

use Illuminate\Support\Facades\{Log, Storage};
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use LLPhant\Embeddings\{Document, DocumentSplitter\DocumentSplitter};
use Illuminate\Queue\{InteractsWithQueue, SerializesModels};
use Probots\Pinecone\Client as Pinecone;
use Illuminate\Bus\Queueable;
use App\Models\Message;
use OpenAI\Client as OpenAI;

class MessageEmbeddingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    const CHUNK_SIZE = 800;
    const MAX_CHUNKS = 150;
    const WORD_OVERLAP = 10;

    public function __construct(public Message $message) {}

    public function handle(OpenAI $openai, Pinecone $pinecone)
    {
        $messageChunks = $this->splitMessage();
        $fileChunks = $this->splitFile();

        $vectors = [];
        foreach ($messageChunks as $index => $chunk) {
            if ($index >= self::MAX_CHUNKS) break;
            $vectors[] = $this->chunkToPineconeVec($openai, $chunk, count($vectors), false);
        }

        foreach ($fileChunks as $index => $chunk) {
            if (count($vectors) >= self::MAX_CHUNKS) break;
            $vectors[] = $this->chunkToPineconeVec($openai, $chunk, count($vectors), true);
        }

        if (empty($vectors)) return;
        
        Log::info('Storing message embeddings', [
            'count' => count($vectors),
            'message_id' => $this->message->id,
        ]);

        $response = $pinecone->data()->vectors()->upsert(vectors: $vectors);

        if (!$response->successful()) {
            Log::error('Failed to store message embeddings', [
                'message_id' => $this->message->id,
                'response' => $response->json()
            ]);
        } else {
            Log::info('Message embeddings stored successfully', [
                'message_id' => $this->message->id,
                'response' => $response->json()
            ]);
        }
    }

    private function splitMessage(): array
    {
        if (empty($this->message->content)) return [];

        $doc = new Document();
        $doc->content = $this->message->content;

        return array_map(
            fn($doc) => $doc->content,
            DocumentSplitter::splitDocument($doc, self::CHUNK_SIZE)
        );
    }

    private function splitFile(): array
    {
        if (!$this->message->attachment_path) return [];

        $extension = pathinfo($this->message->attachment_name, PATHINFO_EXTENSION);
        if (!in_array($extension, ['txt', 'md'])) return [];

        $file = Storage::get($this->message->attachment_path);

        $doc = new Document();
        $doc->content = $file;

        return array_map(
            fn($doc) => $doc->content,
            DocumentSplitter::splitDocument($doc, self::CHUNK_SIZE)
        );
    }

    private function chunkToPineconeVec(OpenAI $openai, string $chunk, int $index, bool $isFileChunk): array 
    {
        $header = $isFileChunk 
            ? "file '{$this->message->attachment_name}' uploaded by {$this->message->user->name}"
            : "message from {$this->message->user->name}";
            
        $response = $openai->embeddings()->create([
            'input' => "Source: {$header}\n\n{$chunk}",
            'model' => config('services.openai.embedding_model'),
        ]);

        $metadata = [
            'channel_id' => $this->message->channel_id,
            'user_id' => $this->message->user_id,
            'message_id' => $this->message->id,
            'context' => $chunk,
        ];

        if ($isFileChunk) $metadata['attachment_name'] = $this->message->attachment_name;

        return [
            'id' => "{$this->message->id}-{$index}",
            'values' => $response->embeddings[0]->embedding,
            'metadata' => $metadata,
        ];
    }
} 