<?php

namespace App\Enums;

enum UserStatus: string
{
    case Active = 'Active';
    case Away = 'Away';
    case DND = 'Do Not Disturb';
    case Offline = 'Offline';
} 