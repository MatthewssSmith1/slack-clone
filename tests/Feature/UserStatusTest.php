<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Support\Facades\Event;
use App\Events\UserStatusChanged;

test('user can update their status to do not disturb', function () {
    Event::fake();
    $user = User::factory()->create(['status' => 'active']);

    $response = $this
        ->actingAs($user)
        ->postJson(route('user.status.update'), [
            'status' => 'dnd',
        ]);

    $response->assertJson(['status' => 'success']);
    
    // Check database was updated
    $this->assertEquals('dnd', $user->fresh()->status);
    
    // Check event was dispatched
    Event::assertDispatched(UserStatusChanged::class, function ($event) use ($user) {
        return $event->user->id === $user->id && $event->status === 'dnd';
    });
    
    // Test that the dashboard page renders with updated status
    $response = $this->get('/dashboard');
    
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Dashboard')
        ->has('auth.user', fn (Assert $page) => $page
            ->where('id', $user->id)
            ->where('status', 'dnd')
        )
    );
}); 