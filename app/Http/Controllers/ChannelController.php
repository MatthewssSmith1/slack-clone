<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Enums\ChannelType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChannelController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $channels = $user->channels()
            ->with(['messages.user'])
            ->select('channels.*')
            ->with(['users' => function($query) use ($user) {
                $query->select('users.id', 'users.name', 'users.status')
                    ->where('users.id', '!=', $user->id);
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($channel) use ($user) {
                if ($channel->channel_type === ChannelType::Direct) {
                    // Filter out the current user's name from DM channel names
                    $channel->name = collect(explode(', ', $channel->name))
                        ->reject(fn($name) => $name === $user->name)
                        ->join(', ');
                }
                return $channel;
            });

        return response()->json([
            'channels' => $channels
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'channel_type' => ['required', 'string', 'in:public,direct'],
            'description' => ['nullable', 'string', 'max:1000'],
            'user_ids' => ['required_if:channel_type,direct', 'array'],
            'user_ids.*' => ['exists:users,id']
        ]);

        $channel = Channel::create([
            'name' => $validated['name'],
            'channel_type' => $validated['channel_type'],
            'description' => $validated['description'] ?? null,
            'created_by' => Auth::id()
        ]);

        if (isset($validated['user_ids'])) {
            $channel->users()->attach($validated['user_ids']);
        }

        // Always add the creator to the channel
        $channel->users()->syncWithoutDetaching([Auth::id()]);

        return response()->json([
            'channel' => $channel->loadCount('users')->load(['messages.user', 'users'])
        ], 201);
    }

    public function show(Channel $channel): JsonResponse
    {
        if (!$channel->users()->where('user_id', Auth::id())->exists()) {
            abort(403, 'You do not have access to this channel.');
        }

        return response()->json([
            'channel' => $channel->loadCount('users')->load(['messages.user', 'users'])
        ]);
    }

    public function update(Request $request, Channel $channel): JsonResponse
    {
        // $this->authorize('update', $channel);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $channel->update($validated);

        return response()->json([
            'channel' => $channel->fresh(['messages.user', 'users'])
        ]);
    }

    public function destroy(Channel $channel): JsonResponse
    {
        // $this->authorize('delete', $channel);

        $channel->delete();

        return response()->json([], 204);
    }

    public function redirectToFirstChannel()
    {
        $user = Auth::user();
        $firstChannel = $user->channels()->first();

        if ($firstChannel) {
            return redirect()->route('channels.show', ['channel' => $firstChannel->id]);
        }

        return redirect()->route('dashboard'); // Fallback if no channel is found
    }
} 