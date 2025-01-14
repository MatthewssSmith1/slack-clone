<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\{Auth, DB, Log};
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MessageController extends Controller
{
    use AuthorizesRequests;
    
    public const CHUNK_SIZE = 50;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'channelId' => ['required', 'integer', 'exists:channels,id'],
            'parentId' => ['sometimes', 'integer', 'exists:messages,id'],
            'cursor' => ['sometimes', 'integer', 'min:0']
        ]);

        $channel = Channel::findOrFail($validated['channelId']);

        if (!$channel->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['error' => 'You do not have access to this channel.'], 403);
        }

        $query = $channel->messages()
            ->select('messages.*')
            ->with('user:id,name,profile_picture')
            ->with(['reactions' => function ($query) {
                $query->select('emoji_code', 'user_id', 'message_id');
            }]);

        if (isset($validated['parentId'])) {
            $parentId = $validated['parentId'];
            $query->where(function($q) use ($parentId) {
                $q->where('parent_id', $parentId)->orWhere('id', $parentId);
            });
        } else {
            $query->whereNull('parent_id');
        }

        if (isset($validated['cursor'])) 
            $query->where('created_at', '<', date('Y-m-d H:i:s', $validated['cursor']));

        $messages = $query->orderBy('created_at', 'desc')->limit(self::CHUNK_SIZE)->get();

        $prevMsg = null;
        foreach ($messages as $msg) {
            $msg->isContinuation = $prevMsg && $msg->user_id === $prevMsg->user_id;
            $prevMsg = $msg;

            $msg->setRelation('reactions', 
                collect($msg->reactions->groupBy('emoji_code'))->map(function ($group) {
                    return [
                        'emoji' => $group[0]->emoji_code,
                        'userIds' => $group->pluck('user_id')->toArray(),
                    ];
                })->values()
            );
        }
        if ($prevMsg) $prevMsg->isContinuation = false;

        $nextCursor = $messages->count() === self::CHUNK_SIZE 
            ? $messages->last()->created_at->timestamp : null;
        
        return response()->json([
            'messages' => $messages->values(),
            'nextCursor' => $nextCursor
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'channelId' => ['required', 'integer', 'exists:channels,id'],
            'parentId' => ['sometimes', 'integer', 'exists:messages,id']
        ]);

        $channel = Channel::findOrFail($validated['channelId']);
        
        if (!$channel->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['error' => 'You do not have access to this channel.'], 403);
        }

        $message = $channel->messages()->create([
            'content' => $validated['content'],
            'user_id' => Auth::id(),
            'parent_id' => $validated['parentId'] ?? null
        ]);

        broadcast(new \App\Events\MessagePosted($message));

        return $message->load('user:id,name,profile_picture');
    }
} 