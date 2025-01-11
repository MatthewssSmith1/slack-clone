<?php

namespace App\Http\Controllers;

use App\Events\UserStatusChanged;
use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserStatusController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $statusParts = explode(':', $validated['status'], 2);
        $statusEnum = UserStatus::from($statusParts[0]);
        $customMessage = $statusParts[1] ?? null;

        $user = $request->user();
        $user->status = $customMessage 
            ? "{$statusEnum->value}:{$customMessage}"
            : $statusEnum->value;
        $user->save();

        broadcast(new UserStatusChanged($user, $statusEnum->value))->toOthers();

        return response()->json(['status' => 'success']);
    }
} 