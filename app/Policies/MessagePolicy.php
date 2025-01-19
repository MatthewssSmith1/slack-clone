<?php

namespace App\Policies;

use App\Models\{Message, User};

class MessagePolicy
{
    public function destroy(User $user, Message $message): bool 
    {
        $ownerId = $message->user_id ?? $user->id;

        return $ownerId === $user->id;
    }
} 