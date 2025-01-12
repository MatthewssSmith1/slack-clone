<?php

namespace App\Events;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\{Channel, InteractsWithSockets};
use Illuminate\Queue\SerializesModels;

class StatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $userId,
        public string $status
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('status')];
    }

    public function broadcastWith(): array
    {
        return [
            'userId' => $this->userId,
            'status' => $this->status
        ];
    }
} 