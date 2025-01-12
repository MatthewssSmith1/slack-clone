<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;
    protected static int $emailCounter = 0;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => chr(97 + static::$emailCounter++) . '@gauntletai.com',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'profile_picture' => null,
            'status' => "Active",
            'last_active_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
