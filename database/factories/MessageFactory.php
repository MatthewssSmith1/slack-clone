<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'channel_id' => null,
            'parent_id' => null,
            'content' => fake()->realText(rand(20, 200)),
            'created_at' => fake()->dateTimeBetween('-1 month'),
            'updated_at' => fn (array $attributes) => $attributes['created_at'],
        ];
    }
} 