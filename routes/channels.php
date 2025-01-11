<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users', function ($user) {
    return true;
});

Broadcast::channel('channel.{channelId}', function ($user, $channelId) {
    return true;
});
