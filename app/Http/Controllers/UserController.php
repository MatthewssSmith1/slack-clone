<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\{Auth, Log};
use Illuminate\Http\{JsonResponse, Request};
use App\Events\StatusChanged;
use App\Models\User;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::select(['id', 'name', 'status', 'profile_picture', 'last_active_at'])
            ->orderBy('name')
            ->get();
        
        $currentUserId = Auth::id();

        return response()->json($users->map(function ($user) use ($currentUserId) {
            return array_merge($user->toArray(), [
                'is_current' => $user->id === $currentUserId
            ]);
        }));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'max:255'],
        ]);

        try {
            $user->update(['status' => $validated['status']]);
            
            broadcast(new StatusChanged($user->id, $validated['status']))->toOthers();

            return response()->json([], 200);
        } catch (\Exception $e) {
            return response()->json([], 500);
        }
    }
}
