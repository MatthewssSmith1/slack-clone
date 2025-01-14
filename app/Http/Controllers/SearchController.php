<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Collection;
use Probots\Pinecone\Client as Pinecone;
use Illuminate\Http\Request;
use OpenAI\Client as OpenAI;
use App\Models\Message;

class SearchController extends Controller
{
    private const SIMILARITY_THRESHOLD = 0.3;
    private const SYSTEM_PROMPT = "You are a helpful assistant that will respond to user prompts based on the context of a provided list of messages from a Slack workspace. When referencing specific messages in your response, include their relevance rank number in brackets. Provide clear, concise answers that incorporate the context from relevant messages.";

    public function search(Request $request, OpenAI $openai, Pinecone $pinecone)
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2', 'max:1000'],
        ]);

        $embedding = $this->generateEmbedding($openai, $validated['query']);
        $matches = $this->findSimilarVectors($pinecone, $embedding);
        $similarMessages = $this->getSimilarMessages($matches);
        $formattedMessages = $this->formatMessagesWithScores($similarMessages);
        
        $chatResponse = $this->generateResponse($openai, $validated['query'], $similarMessages);
        
        return response()->json([
            'results' => [...$formattedMessages, $chatResponse]
        ]);
    }

    private function generateEmbedding(OpenAI $openai, string $query): array
    {
        $response = $openai->embeddings()->create([
            'model' => config('services.openai.embedding_model'),
            'input' => $query,
        ]);

        return $response->embeddings[0]->embedding;
    }

    private function findSimilarVectors(Pinecone $pinecone, array $embedding): Collection
    {
        $knnResponse = $pinecone->data()->vectors()->query(
            vector: $embedding,
            topK: 5,
        );

        if (!$knnResponse->successful()) {
            return collect([]);
        }

        return collect($knnResponse->json('matches'))
            ->filter(fn($match) => $match['score'] >= self::SIMILARITY_THRESHOLD);
    }

    private function getSimilarMessages(Collection $matches): Collection
    {
        if ($matches->isEmpty()) {
            return collect([[
                'content' => 'No messages found with close enough meaning',
                'score' => 0,
                'name' => 'System'
            ]]);
        }

        return Message::whereIn('id', $matches->pluck('id'))
            ->get()
            ->map(function ($message) use ($matches) {
                return [
                    'content' => $message->content,
                    'score' => $matches->firstWhere('id', (string) $message->id)['score'],
                    'name' => $message->user->name
                ];
            })
            ->sortByDesc('score')
            ->values();
    }

    private function formatMessagesWithScores(Collection $messages): array
    {
        return $messages->map(function ($item, $index) {
            return sprintf(
                '[%d] %s: %s',
                $index + 1,
                $item['name'],
                $item['content']
            );
        })->all();
    }

    private function generateResponse(OpenAI $openai, string $query, Collection $similarMessages): string
    {
        $userPrompt = $this->formatCompletionPrompt($query, $similarMessages->all());

        Log::info($userPrompt);

        $response = $openai->chat()->create([
            'model' => 'gpt-4',
            'messages' => [
                ['role' => 'system', 'content' => self::SYSTEM_PROMPT],
                ['role' => 'user', 'content' => $userPrompt]
            ],
            'max_tokens' => 400,
            'temperature' => 0.7,
        ]);

        return trim($response->choices[0]->message->content);
    }

    private function formatCompletionPrompt(string $query, array $similarMessages): string 
    {
        $context = collect($similarMessages)
            ->map(fn($item) => $item['content'])
            ->join("\n");

        return <<<PROMPT
## Context
What follows is a list of messages from the workspace that are likely relevant to your query:

{$context}

## Query
{$query}
PROMPT;
    }
} 