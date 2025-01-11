<?php

use App\Models\User;
use App\Models\Channel;
use App\Models\Message;
use Inertia\Testing\AssertableInertia as Assert;

test('dashboard should only load chunk size of messages initially', function () {
    // Create a user and channel with 150 messages
    $user = User::factory()->create();
    $channel = Channel::factory()->create();
    $channel->users()->attach($user->id);
    
    Message::factory()
        ->count(150)
        ->sequence(fn ($sequence) => [
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'created_at' => now()->subMinutes($sequence->index)
        ])
        ->create();

    // Get channels endpoint should return chunked messages
    $response = $this->actingAs($user)
        ->get('/channels');
    
    $channelData = $response->json('channels')[0];
    expect($channelData['messages'])->toHaveCount(Message::CHUNK_SIZE)
        ->and($channelData['messages'])->toHaveCount(20)
        ->and($channelData['messages'][0]['created_at'])->toBeGreaterThan($channelData['messages'][19]['created_at']);
}); 