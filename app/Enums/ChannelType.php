<?php

namespace App\Enums;

enum ChannelType: int
{
    case Public = 0;
    case Private = 1;
    case Direct = 2;
    case Assistant = 3;

    public function label(): string
    {
        return match($this) {
            self::Public => 'Public Channel',
            self::Private => 'Private Channel',
            self::Direct => 'Direct Message',
            self::Assistant => 'Assistant',
        };
    }
} 