<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'First User',
            'email' => 'a@example.com',
        ]);

        User::factory(9)->create();
    }
}
