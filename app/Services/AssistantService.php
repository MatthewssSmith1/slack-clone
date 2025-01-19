<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use App\Events\MessagePosted;
use App\Models\Message;
use App\Data\{AssistantOptions, PineconeVector};
use OpenAI\Client as OpenAIClient;
use Probots\Pinecone\Client as PineconeClient;
use App\Models\User;

class AssistantService
{
    private const TOP_K = 10;
    private const SIMILARITY_THRESHOLD = 0.5;

    public function generateResponse(array $vectors, Message $query, AssistantOptions $opts): void
    {
        try {
            $similarVectors = $this->findSimilarVectors($vectors, $query , $opts);
            foreach ($similarVectors as $vector) {
              Log::info('Similar vector', [
                'vector' => $vector
              ]);
            }
            $contextChunks = $this->formatVectorsToContextChunks($similarVectors);

            $message = $query->channel->messages()->create([
                'content' => $this->generateChatResponse($query, $contextChunks, $opts),
            ]);

            $index = 1;
            collect($similarVectors)->each(function($vector) use ($message, &$index) {
                $message->linksTo()->attach([
                    'id' => $vector['metadata']['message_id'],
                    'rank' => $index++,
                    'title' => $vector['metadata']['title'],
                    'tooltip' => substr($vector['metadata']['context'], 0, 150),
                    'tgt_created_at' => $message->created_at,
                ]);
            });

            broadcast(new MessagePosted($message));
        } catch (\Exception $e) {
            Log::error('Failed to generate assistant response', [
                'message_id' => (string) $query->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function findSimilarVectors(array $vectors, Message $query, AssistantOptions $opts): array
    {
        $filter = $this->buildPineconeFilter($opts, $query);
        $response = $this->pinecone->data()->vectors()->query(
            vector: $vectors[0]->values,
            topK: self::TOP_K,
            filter: $filter
        );

        if (!$response->successful()) return [];

        return collect($response->json('matches'))
            ->filter(fn($match) => $match['score'] >= self::SIMILARITY_THRESHOLD)
            ->all();
    }

    private function formatVectorsToContextChunks(array $vectors): array
    {
        if (empty($vectors)) return [];

        $userNames = User::pluck('name', 'id')->all();

        return collect($vectors)
            ->map(function($match) use ($userNames) {
                $metadata = $match['metadata'];

                $userId = $metadata['user_id'] ?? null;
                $userName = $userId 
                  ? ($userNames[$userId] ?? 'Unknown User') 
                  : 'System';
                
                return "[{$userName}]\n{$metadata['context']}\n\n";
            })
            ->all();
    }

    private function buildPineconeFilter(AssistantOptions $opts, Message $query): array
    {
        $conditions = [];

        if ($opts->channelId) {
            $conditions[] = ['channel_id' => ['$eq' => $opts->channelId]];
        } else {
            $conditions[] = ['channel_id' => ['$ne' => '-1']];
        }

        if ($opts->userId) {
            $conditions[] = ['user_id' => ['$eq' => $opts->userId]];
        }

        $conditions[] = ['message_id' => ['$ne' => $query->id]];

        return ['$and' => $conditions];
    }

    private const CONTEXT_HEADER = 'CONTEXT:';
    private const QUERY_HEADER = 'USER QUERY:';

    private function generateChatResponse(Message $query, array $context, AssistantOptions $opts): string
    {
        $contextStr = empty($context) ? "No relevant context found." : implode("\n", $context);
        $userNames = User::pluck('name', 'id')->all();
        
        $previousMessages = $query->channel->messages()->where('id', '!=', $query->id)
            ->get()->map(function($message) use ($userNames, $query) {
                $userName = $message->user_id 
                    ? ($userNames[$message->user_id] ?? 'Unknown User')
                    : 'System';
                    
                return [
                    'role' => $message->user_id === $query->user_id ? 'user' : 'assistant',
                    'content' => "[{$userName}] {$message->content}"
                ];
            });

        $userPrompt = implode("\n", [
          self::CONTEXT_HEADER, 
          $contextStr, 
          self::QUERY_HEADER, 
          $query->content
        ]);
        
        $response = $this->openai->chat()->create([
            'model' => 'gpt-4',
            'messages' => [
                ['role' => 'system', 'content' => $this->getSystemPrompt($opts)],
                ...$previousMessages->toArray(),
                ['role' => 'user', 'content' => $userPrompt]
            ],
            'max_tokens' => 400,
            'temperature' => 0.7,
        ]);

        return trim($response->choices[0]->message->content);
    }

    private function getSystemPrompt(AssistantOptions $opts): string
    {
        if ($opts->isPersona && $opts->userId) {
            $name = User::find($opts->userId)->name;
            return "You are {$name}. Use the " . self::CONTEXT_HEADER . " section and previous messages to understand and mimic their communication style. Respond to any instances of " . self::QUERY_HEADER . " in a way that authentically represents how they would communicate based on the context, or any persona you choose if no context is provided (still pretend to be {$name}).";
        }

        return "You are an AI assistant in a chat application. Use the " . self::CONTEXT_HEADER . " section and previous messages to provide informed, relevant responses to each " . self::QUERY_HEADER . ". Focus on being helpful while keeping responses concise and professional.";
    }

    public function __construct(
        private readonly OpenAIClient $openai,
        private readonly PineconeClient $pinecone
    ) {}
} 