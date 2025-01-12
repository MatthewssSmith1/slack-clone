<?php

namespace App\Http\Controllers;

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

        // First remove any existing reaction
        $message->reactions()->detach(auth()->id());
        
        // Then add the new one
        $message->reactions()->attach(auth()->id(), [
            'emoji_code' => $validated['emoji_code'],
        ]);

        return response()->json([
            'success' => true,
            'user' => auth()->user(),
            'emoji_code' => $validated['emoji_code'],
        ]);
    }

    public function destroy(Message $message): JsonResponse
    {
        $message->reactions()->detach(auth()->id());
        return response()->json(['success' => true]);
    }
} 