<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create channels first
        $channels = Channel::factory(4)->create();

        // Create users
        $users = User::factory(10)->create();

        // Create messages in each channel from random users
        $channels->each(function ($channel) use ($users) {
            // Add all users to public channels
            $channel->users()->attach($users->pluck('id'));
            
            // Create 5-15 messages per channel
            Message::factory()
                ->count(rand(5, 15))
                ->sequence(fn ($sequence) => [
                    'channel_id' => $channel->id,
                    'user_id' => $users->random()->id,
                ])
                ->create();
        });

        // Create direct message channels between random pairs of users
        $userPairs = $this->generateRandomUserPairs($users, 15);
        
        foreach ($userPairs as $pair) {
            $dmChannel = Channel::factory()
                ->direct()
                ->create([
                    'name' => $pair->map->name->join(', '),
                ]);
            
            // Add only the two users to this channel
            $dmChannel->users()->attach($pair->pluck('id'));
            
            // Create 3-10 messages between these users
            Message::factory()
                ->count(rand(3, 10))
                ->sequence(fn ($sequence) => [
                    'channel_id' => $dmChannel->id,
                    'user_id' => $pair[$sequence->index % 2]->id,
                ])
                ->create();
        }
    }

    /**
     * Generate random unique pairs of users
     */
    private function generateRandomUserPairs(Collection $users, int $count): array
    {
        $pairs = [];
        $usedPairs = [];
        
        while (count($pairs) < $count) {
            $pair = $users->random(2);
            $pairKey = $pair->sortBy('id')->pluck('id')->join('-');
            
            // Only add if this pair hasn't been used yet
            if (!isset($usedPairs[$pairKey])) {
                $pairs[] = $pair;
                $usedPairs[$pairKey] = true;
            }
        }
        
        return $pairs;
    }
}
