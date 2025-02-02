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
        $channels = Channel::factory(4)->create();

        $users = User::factory(10)->create();

        $channels->each(function ($channel) use ($users) {
            // Add all users to public channels
            $channel->users()->attach($users->pluck('id'));
            
            Message::factory()
                ->count(rand(75,100))
                ->sequence(fn ($sequence) => [
                    'channel_id' => $channel->id,
                    'user_id' => $users->random()->id,
                ])
                ->create();
        });

        // Create direct message channels between random pairs of users
        $userPairs = $this->generateRandomUserPairs($users, 25);
        
        foreach ($userPairs as $pair) {
            $dmChannel = Channel::factory()
                ->direct()
                ->name($pair->map->name->join(', '))
                ->create();
            
            $dmChannel->users()->attach($pair->pluck('id'));
            
            Message::factory()
                ->count(rand(20,40))
                ->sequence(fn ($sequence) => [
                    'channel_id' => $dmChannel->id,
                    'user_id' => $pair[$sequence->index % 2]->id,
                ])
                ->create();
        }

        $users->each(function ($user) {
            $assistantChannel = Channel::factory()->assistant()->name('Assistant')->create();
            $assistantChannel->users()->attach($user->id);
        });
    }

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
