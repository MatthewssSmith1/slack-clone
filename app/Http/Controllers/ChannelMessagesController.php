<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ChannelMessagesController extends Controller
{
    public function index(Request $request, Channel $channel): JsonResponse
    {
        // Check channel access
        if (!$channel->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['error' => 'You do not have access to this channel.'], 403);
        }

        try {
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
                    $message->formatted_reactions = $message->reactions ? json_decode($message->reactions, true) : [];
                    unset($message->reactions);
                    return $message;
                })
                ->reverse()
                ->values();

            return response()->json([
                'data' => [
                    'messages' => $messages
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to load messages', [
                'channel_id' => $channel->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to load messages',
                'details' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
} 