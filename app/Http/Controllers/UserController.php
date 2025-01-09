<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        // TODO: Add workspace filtering when workspaces are implemented
        // $workspace = $request->user()->currentWorkspace;
        // $users = $workspace->users()->get();
        
        $users = User::select(['id', 'name', 'status', 'profile_picture', 'last_active_at'])
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }
}
