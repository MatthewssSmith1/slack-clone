<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\Builder;

class ChannelMessagesController extends Controller
{
    public function index(
        Request $request,
        Channel $channel,
    ): Response {
        $user = $request->user();
        $channelUser = $channel->users()->where('user_id', $user->id)->first();
        
        // Determine the reference timestamp
        $referenceTimestamp = $this->getReferenceTimestamp($channelUser?->last_read_at);
        
        $query = $channel->messages()
            ->when(
                $request->input('before'),
                fn (Builder $query, string $timestamp) => 
                    $query->where('created_at', '<', $timestamp),
                // On initial load, get messages before reference timestamp
                fn (Builder $query) =>
                    $query->where('created_at', '<=', $referenceTimestamp)
            )
            ->with(['user:id,name,profile_picture'])
            ->latest();

        // Get one extra message to determine if there are more
        $messages = $query->take(Message::CHUNK_SIZE + 1)->get();
        
        // Check if we have more messages
        $hasMore = $messages->count() > Message::CHUNK_SIZE;
        
        // Remove the extra message if we have more
        if ($hasMore) {
            $messages = $messages->take(Message::CHUNK_SIZE);
        }

        $messages = $messages->reverse()->values();
        
        return response()->json([
            'messages' => $messages,
            'hasMore' => $hasMore,
            'oldestMessageAt' => $messages->last()?->created_at?->toDateTimeString(),
        ]);
    }

    private function getReferenceTimestamp(?Carbon $lastReadAt): Carbon
    {
        $now = now();
        
        // If no last_read_at or it's within threshold, use current time
        if (!$lastReadAt || 
            $lastReadAt->diffInMinutes($now) <= Message::RECENT_THRESHOLD_MINUTES) {
            return $now;
        }

        return $lastReadAt;
    }
} 