<?php

namespace App\Enums;

enum UserStatus: string
{
    // Standard status variants - for custom statuses, the raw `status` message
    // is stored directly in the users.status field instead of using an enum variant converted to a string
    case Active = 'Active';
    case Away = 'Away';
    case DND = 'Do Not Disturb';
    case Offline = 'Offline';
    case Custom = 'Custom';
} 