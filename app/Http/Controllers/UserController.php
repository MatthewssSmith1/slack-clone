<?php

namespace App\Http\Controllers;

use App\Events\UserStatusChanged;
use App\Enums\UserStatus;
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
        // Ensure user can only update their own status
        if ($request->user()->id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'required', 'string'],
            // Add other user fields here as needed
        ]);

        if (isset($validated['status'])) {
            $statusParts = explode(':', $validated['status'], 2);
            $statusEnum = UserStatus::from($statusParts[0]);
            $customMessage = $statusParts[1] ?? null;

            $user->status = $customMessage 
                ? "{$statusEnum->value}:{$customMessage}"
                : $statusEnum->value;
            
            broadcast(new UserStatusChanged($user, $statusEnum->value))->toOthers();
        }

        $user->save();

        return response()->json(['status' => 'success']);
    }
}
