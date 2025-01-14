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

        $user = auth()->user();

        $message->reactions()->detach($user->id);
        $message->reactions()->attach($user->id, [
            'emoji_code' => $validated['emoji_code'],
        ]);

        broadcast(new ReactionPosted($message, $user->id, $validated['emoji_code']))->toOthers();

        return response()->json([], 200);
    }

    public function destroy(Message $message): JsonResponse
    {
        $user = auth()->user();
        $message->reactions()->detach($user->id);

        broadcast(new ReactionPosted($message, $user->id, ''))->toOthers();

        return response()->json([], 200);
    }
} 