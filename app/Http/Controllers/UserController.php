<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
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
}
