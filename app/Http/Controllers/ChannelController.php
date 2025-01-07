<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ChannelController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $user = auth()->user();
        
        $channels = $user->channels()
            ->withCount('users')
            ->with(['messages' => function ($query) {
                $query->with('user:id,name,profile_picture')
                    ->orderBy('created_at', 'asc')
                    ->limit(50);
            }])
            ->get();

        return Inertia::render('Dashboard', [
            'channels' => $channels,
            'currentChannel' => $channels->first(),
        ]);
    }

    public function show(Channel $channel)
    {
        $this->authorize('view', $channel);

        return Inertia::render('Dashboard', [
            'channels' => auth()->user()->channels()->withCount('users')->get(),
            'currentChannel' => $channel->loadCount('users')->load([
                'messages' => fn($query) => $query
                    ->with('user:id,name,profile_picture')
                    ->orderBy('created_at', 'asc')
                    ->limit(50)
            ]),
        ]);
    }
} 