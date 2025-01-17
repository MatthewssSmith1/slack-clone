<?php

namespace Database\Factories;

use App\Enums\ChannelType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Channel>
 */
class ChannelFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'description' => fake()->optional(0.7)->sentence(),
            'channel_type' => ChannelType::Public,
            'created_at' => fake()->dateTimeBetween('-1 year'),
            'updated_at' => fn (array $attributes) => $attributes['created_at'],
        ];
    }

    public function name(string $name): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => $name,
        ]);
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel_type' => ChannelType::Public,
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel_type' => ChannelType::Private,
        ]);
    }

    public function direct(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel_type' => ChannelType::Direct,
        ]);
    }

    public function assistant(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel_type' => ChannelType::Assistant,
        ]);
    }
} 