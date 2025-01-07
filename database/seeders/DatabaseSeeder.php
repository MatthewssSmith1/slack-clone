<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Database\Seeder;

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
    }
}
