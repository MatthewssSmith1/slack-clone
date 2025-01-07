<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MessageController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Channel $channel)
    {
        $this->authorize('view', $channel);
        
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
        ]);

        $message = $channel->messages()->create([
            'content' => $validated['content'],
            'user_id' => Auth::id(),
        ]);

        broadcast(new \App\Events\MessagePosted($message));

        return $message->load('user:id,name,profile_picture');
    }
} 