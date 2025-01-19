<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Collection;
use Probots\Pinecone\Client as Pinecone;
use Illuminate\Http\Request;
use App\Models\Message;
use OpenAI\Client as OpenAI;

class SearchController extends Controller
{
    private const TOP_K = 5;
    private const SIMILARITY_THRESHOLD = 0.2;
    private const SYSTEM_PROMPT = "You are a helpful assistant that responds to queries based on provided context: excerpts from messages and file attachments. Each part of the context will start with a bracketed relevance rank (e.g. `[1] {source} {excerpt}`); reference excerpts by this number at the end of sentences where they are relevant.";

    public function search(Request $request, OpenAI $openai, Pinecone $pinecone)
    {
        try {
            $query = $request->validate(['query' => ['required', 'string', 'min:2', 'max:1000']])['query'];

            $embedding = $this->generateEmbedding($openai, $query);
            $matches = $this->findSimilarVectors($pinecone, $embedding);
            $formattedChunks = $this->formatChunks($matches);
            $chatResponse = $this->generateResponse($openai, $query, $matches);
            
            return response()->json([
                'results' => [$chatResponse, ...$formattedChunks]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'An unexpected error occurred while searching'], 500);
        }
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
        $knnResponse = $pinecone->data()->vectors()->query(vector: $embedding, topK: self::TOP_K);

        if (!$knnResponse->successful()) return collect([]);

        return collect($knnResponse->json('matches'))
            ->filter(fn($match) => $match['score'] >= self::SIMILARITY_THRESHOLD);
    }

    private function formatChunks(Collection $matches): array
    {
        if ($matches->isEmpty()) {
            return ['No content found with close enough meaning'];
        }

        // TODO: Add user name to prefix (fetch users with user_id in metadata)
        return $matches->map(function ($match, $index) {
            $metadata = $match['metadata'];
            $prefix = isset($metadata['attachment_name']) 
                ? "File '{$metadata['attachment_name']}'"
                : "Message";

            return sprintf('[%d] %s: %s', $index + 1, $prefix, $metadata['context']);
        })->all();
    }

    private function generateResponse(OpenAI $openai, string $query, Collection $matches): string
    {
        $userPrompt = $this->formatCompletionPrompt($query, $matches);

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

    private function formatCompletionPrompt(string $query, Collection $matches): string 
    {
        $context = $matches->map(fn($match) => $match['metadata']['context'])->join("\n");

        return <<<PROMPT
CONTEXT:
What follows is a list of messages and file contents from the workspace that are likely relevant to your query:

{$context}


QUERY:
{$query}
PROMPT;
    }
} 