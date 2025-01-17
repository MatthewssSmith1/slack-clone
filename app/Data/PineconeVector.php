<?php

namespace App\Data;

class PineconeVector
{
    public function __construct(
        public readonly string $id,
        public readonly array $values,
        public readonly array $metadata,
    ) {}
} 