<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Channel;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('channel.{channelId}', function ($user, $channelId) {
    $channel = Channel::find($channelId);
    return $channel && $user->can('view', $channel);
});
