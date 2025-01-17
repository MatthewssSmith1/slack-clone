<?php

namespace App\Data;

class AssistantOptions
{
    public function __construct(
        public readonly ?int $channelId = null,
        public readonly ?int $userId = null,
        public readonly bool $isPersona = false,
    ) {}

    public static function fromJson(?string $json): ?self
    {
        if (!$json) return null;
        
        $data = json_decode($json, true);
        return new self(
            channelId: $data['channelId'] ?? null,
            userId: $data['userId'] ?? null,
            isPersona: $data['isPersona'] ?? false,
        );
    }

    public static function validationRules(string $key): array 
    {
        return [
            "$key" => ['nullable', 'json'],
            "$key.isPersona" => ['sometimes', 'boolean'],
            "$key.userId" => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            "$key.channelId" => ['sometimes', 'nullable', 'integer', 'exists:channels,id'],
        ];
    }
} 