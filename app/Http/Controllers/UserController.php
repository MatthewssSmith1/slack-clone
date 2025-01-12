<?php

namespace App\Http\Controllers;

use App\Events\StatusChanged;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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
            
            broadcast(new StatusChanged($user, $validated['status']))->toOthers();

            return response()->json([
                'message' => 'Status updated successfully',
                'user' => $user->only(['id', 'name', 'status'])
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update status'], 500);
        }
    }
}
