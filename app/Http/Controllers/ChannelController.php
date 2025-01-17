<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Enums\{ChannelType, Role};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Log};
use Inertia\Response;

class ChannelController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $channels = $user->channels()
            ->with(['messages.user'])
            ->select('channels.*')
            ->with(['users' => function($query) use ($user) {
                $query->select('users.id')
                    ->where('users.id', '!=', $user->id);
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($channel) use ($user) {
                if ($channel->channel_type === ChannelType::Direct) {
                    // Filter out the current user's name from DM channel names
                    $channel->name = collect(explode(', ', $channel->name))
                        ->reject(fn($name) => $name === $user->name)
                        ->join(', ');
                }
                // Transform users to user_ids
                $channel->user_ids = $channel->users->pluck('id')->all();
                unset($channel->users);
                return $channel;
            });

        return response()->json([
            'channels' => $channels
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:30'],
            'selectedUsers' => ['required', 'array'],
            'selectedUsers.*' => ['exists:users,id'],
        ]);

        $channel = Channel::create([
            'name' => $validated['name'],
            'channel_type' => ChannelType::Public,
            'description' => null,
        ]);

        $channel->users()->attach(Auth::id(), ['role' => Role::Owner]);

        $channel->users()->attach(
            collect($validated['selectedUsers'])
                ->reject(fn($id) => $id === Auth::id())
                ->mapWithKeys(fn($id) => [$id => ['role' => Role::Member]])
                ->all()
        );

        $channel->user_ids = collect($validated['selectedUsers'])
            ->push(Auth::id())
            ->unique()
            ->values()
            ->all();

        return response()->json([
            'channel' => $channel
        ], 201);
    }

    public function show(Channel $channel): JsonResponse
    {
        if (!$channel->users()->where('user_id', Auth::id())->exists()) {
            abort(403, 'You do not have access to this channel.');
        }

        $channel->loadCount('users')->load(['messages.user']);
        $channel->user_ids = $channel->users->pluck('id')->all();
        unset($channel->users);

        return response()->json([
            'channel' => $channel
        ]);
    }

    // public function update(Request $request, Channel $channel): JsonResponse
    // {

    //     $validated = $request->validate([
    //         'name' => ['sometimes', 'string', 'max:255'],
    //         'description' => ['nullable', 'string', 'max:1000'],
    //     ]);

    //     $channel->update($validated);

    //     return response()->json([
    //         'channel' => $channel->fresh(['messages.user', 'users'])
    //     ]);
    // }

    // public function destroy(Channel $channel): JsonResponse
    // {

    //     $channel->delete();

    //     return response()->json([], 204);
    // }

    // public function redirectToFirstChannel()
    // {
    //     $user = Auth::user();
    //     $firstChannel = $user->channels()->first();

    //     if ($firstChannel) {
    //         return redirect()->route('channels.show', ['channel' => $firstChannel->id]);
    //     }

    //     return redirect()->route('dashboard'); // Fallback if no channel is found
    // }
} 