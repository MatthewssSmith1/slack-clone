<?php

namespace App\Http\Controllers;

use App\Events\ReactionPosted;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    public function store(Request $request, Message $message): JsonResponse 
    {
        $validated = $request->validate([
            'emoji_code' => ['required', 'string', 'max:8'],
        ]);

        $message->reactions()->detach(auth()->id());
        
        $message->reactions()->attach(auth()->id(), [
            'emoji_code' => $validated['emoji_code'],
        ]);

        $user = auth()->user();

        broadcast(new ReactionPosted(
            $message,
            $user,
            $validated['emoji_code']
        ))->toOthers();

        return response()->json([
            'message_id' => $message->id,
            'user' => $user->only(['id', 'name', 'profile_picture']),
            'emoji_code' => $validated['emoji_code'],
            'removed' => false,
        ]);
    }

    public function destroy(Message $message): JsonResponse
    {
        $message->reactions()->detach(auth()->id());
        
        $user = auth()->user();

        broadcast(new ReactionPosted(
            $message,
            $user,
            '', // Empty emoji code for removal
            true
        ))->toOthers();

        return response()->json([
            'message_id' => $message->id,
            'user' => $user->only(['id', 'name', 'profile_picture']),
            'emoji_code' => '',
            'removed' => true,
        ]);
    }
} 