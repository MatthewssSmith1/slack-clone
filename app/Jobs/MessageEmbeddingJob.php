<?php

namespace App\Jobs;

use Illuminate\Support\Facades\{Log, Storage};
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use LLPhant\Embeddings\{Document, DocumentSplitter\DocumentSplitter};
use Illuminate\Queue\{InteractsWithQueue, SerializesModels};
use App\Services\AssistantService;
use App\Data\{AssistantOptions, PineconeVector};
use Probots\Pinecone\Client as Pinecone;
use Illuminate\Bus\Queueable;
use App\Models\Message;
use OpenAI\Client as OpenAI;
use App\Enums\ChannelType;

class MessageEmbeddingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    const CHUNK_SIZE = 800;
    const MAX_CHUNKS = 150;
    const WORD_OVERLAP = 10;

    public function __construct(
        public Message $message,
        public ?AssistantOptions $assistantOpts = null
    ) {}

    public function handle(OpenAI $openai, Pinecone $pinecone, AssistantService $assistantService)
    {
        $messageChunks = $this->textToChunks($this->message->content);
        $messageCount = count($messageChunks);

        $vectors = collect([...$messageChunks, ...$this->fileToChunks()])
            ->take(self::MAX_CHUNKS)
            ->values()
            ->map(fn($chunk, $i) => $this->chunkToPineconeVec($openai, $chunk, $i, $i >= $messageCount))
            ->all();
        if (empty($vectors)) return;
        
        $pinecone->data()->vectors()->upsert(vectors: $vectors);

        if ($this->assistantOpts) 
            $assistantService->generateResponse($vectors, $this->message, $this->assistantOpts);
    }

    private function fileToChunks(): array
    {
        if (!$this->message->attachment_path) return [];

        $extension = pathinfo($this->message->attachment_name, PATHINFO_EXTENSION);
        if (!in_array($extension, ['txt', 'md'])) return [];

        $file = Storage::get($this->message->attachment_path);

        return $this->textToChunks($file);
    }

    private function textToChunks(string $content): array
    {
        if (empty($content)) return [];

        $doc = new Document();
        $doc->content = $content;

        return array_map(
            fn($doc) => $doc->content,
            DocumentSplitter::splitDocument($doc, self::CHUNK_SIZE, ' ', self::WORD_OVERLAP)
        );
    }

    private function chunkToPineconeVec(OpenAI $openai, string $chunk, int $index, bool $isFileChunk): PineconeVector 
    {
        $header = $isFileChunk 
            ? "file '{$this->message->attachment_name}' uploaded by {$this->message->user->name}"
            : "message from {$this->message->user->name}";
            
        $response = $openai->embeddings()->create([
            'input' => "Source: {$header}\n\n{$chunk}",
            'model' => config('services.openai.embedding_model'),
        ]);

        return new PineconeVector(
            id: "{$this->message->id}-{$index}",
            values: $response->embeddings[0]->embedding,
            metadata: $this->getMetadata($chunk),
        );
    }

    private function getMetadata(string $chunk): array
    {
        $metadata = [
            'channel_id' => $this->message->channel_id,
            'message_id' => $this->message->id,
            'context' => $chunk,
        ];

        if ($this->message->user_id) $metadata['user_id'] = $this->message->user_id;

        return $metadata;   
    }
} 