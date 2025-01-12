<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use SoftDeletes, HasFactory;

    public const CHUNK_SIZE = 50;
    public const RECENT_THRESHOLD_MINUTES = 5;

    /** @var list<string> */
    protected $with = [
        'user',
    ];

    protected $fillable = [
        'user_id',
        'channel_id',
        'parent_id',
        'content',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Message::class, 'parent_id');
    }

    public function reactions(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'reactions')
            ->withPivot('emoji_code')
            ->withTimestamps();
    }
}
