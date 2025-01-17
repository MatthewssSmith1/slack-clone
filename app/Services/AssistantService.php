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
    private const TOP_K = 5;
    private const SIMILARITY_THRESHOLD = 0.2;

    public function generateResponse(array $vectors, Message $query, AssistantOptions $opts): void
    {
        try {
            $matches = $this->findSimilarVectors($vectors, $opts);
            foreach ($matches as $match) {
              Log::info("{$match}\n\n");
            }
            // TODO: load previous messages from the assistant channel
            $response = $this->generateChatResponse($query, $matches, $opts);

            $message = $query->channel->messages()->create([
                'content' => $response,
            ]);

            Log::info('RESPONSE', ['message' => $message]);

            broadcast(new MessagePosted($message));
        } catch (\Exception $e) {
            Log::error('Failed to generate assistant response', [
                'message_id' => $query->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    private function findSimilarVectors(array $vectors, AssistantOptions $opts): array
    {
        $filter = $this->buildPineconeFilter($opts);

        $response = $this->pinecone->data()->vectors()->query(
            vector: $vectors[0]->values,
            topK: self::TOP_K,
            filter: $filter
        );

        if (!$response->successful()) return [];

        $userNames = User::pluck('name', 'id')->all();

        return collect($response->json('matches'))
            ->filter(fn($match) => $match['score'] >= self::SIMILARITY_THRESHOLD)
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

    private function buildPineconeFilter(AssistantOptions $opts): array
    {
        if ($opts->channelId && $opts->userId) {
            return [
                '$and' => [
                    'channel_id' => ['$eq' => $opts->channelId],
                    'user_id' => ['$eq' => $opts->userId],
                ]
            ];
        }
        
        if ($opts->channelId) return ['channel_id' => ['$eq' => $opts->channelId]];
        if ($opts->userId) return ['user_id' => ['$eq' => $opts->userId]];
        
        return [];
    }

    private const CONTEXT_HEADER = 'CONTEXT:';
    private const QUERY_HEADER = 'USER QUERY:';

    private function generateChatResponse(Message $query, array $context, AssistantOptions $opts): string
    {
        $contextStr = empty($context) ? "No relevant context found." : implode("\n", $context);
        
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
            return "You are a digital twin of user {$name}. Use the " . self::CONTEXT_HEADER . " section to understand and mimic their communication style. Respond to the " . self::QUERY_HEADER . " in a way that authentically represents how they would communicate based on the context; if none is provided, you are a helpful assistant.";
        }

        return "You are an AI assistant in a chat application. Use the " . self::CONTEXT_HEADER . " section to provide informed, relevant responses to each " . self::QUERY_HEADER . ". Focus on being helpful while keeping responses concise and professional.";
    }

    public function __construct(
        private readonly OpenAIClient $openai,
        private readonly PineconeClient $pinecone
    ) {}
} 