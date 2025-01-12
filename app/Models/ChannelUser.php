<?php

namespace App\Models;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChannelUser extends Model
{
    protected $table = 'channel_user';

    protected $fillable = [
        'channel_id',
        'user_id',
        'role',
        'last_read_at'
    ];

    protected $casts = [
        'role' => Role::class,
        'last_read_at' => 'datetime'
    ];

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
