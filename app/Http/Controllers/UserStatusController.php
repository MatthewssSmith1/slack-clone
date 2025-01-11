<?php

namespace App\Http\Controllers;

use App\Events\UserStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserStatusController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $user = $request->user();
        $user->status = $validated['status'];
        $user->save();

        broadcast(new UserStatusChanged($user, $validated['status']))->toOthers();

        return response()->json(['status' => 'success']);
    }
} 