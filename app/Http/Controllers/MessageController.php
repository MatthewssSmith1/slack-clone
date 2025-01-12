<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MessageController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'channelId' => ['required', 'integer', 'exists:channels,id']
        ]);

        $channel = Channel::findOrFail($request->query('channelId'));

        if (!$channel->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['error' => 'You do not have access to this channel.'], 403);
        }

        // TODO: group reactions in php instead of sql
        $messages = $channel->messages()
            ->select('messages.*')
            ->with('user:id,name,profile_picture')
            ->addSelect([
                'reactions' => DB::table('reactions')
                    ->select(DB::raw('json_group_array(json_object(
                        \'user\', json_object(\'id\', users.id, \'name\', users.name),
                        \'emoji_code\', reactions.emoji_code
                    ))'))
                    ->join('users', 'users.id', '=', 'reactions.user_id')
                    ->whereColumn('reactions.message_id', 'messages.id')
                    ->groupBy('reactions.message_id')
            ])
            ->latest()
            ->get()
            ->map(function ($message) {
                $message->reactions = $message->reactions ? json_decode($message->reactions, true) : [];
                return $message;
            })
            ->reverse()
            ->values();

        return response()->json(['data' => ['messages' => $messages]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'channelId' => ['required', 'integer', 'exists:channels,id']
        ]);

        $channel = Channel::findOrFail($validated['channelId']);
        
        if (!$channel->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['error' => 'You do not have access to this channel.'], 403);
        }

        $message = $channel->messages()->create([
            'content' => $validated['content'],
            'user_id' => Auth::id(),
        ]);

        broadcast(new \App\Events\MessagePosted($message));

        return $message->load('user:id,name,profile_picture');
    }
} 