<?php

namespace App\Models;

use App\Enums\ChannelType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Channel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'channel_type',
    ];

    protected $casts = [
        'channel_type' => ChannelType::class,
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withTimestamps()
            ->withPivot(['role']);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
