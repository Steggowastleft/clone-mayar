<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class BundlingItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'bundling_id',
        'itemable_id',
        'itemable_type',
    ];

    // Relationships
    public function bundling(): BelongsTo
    {
        return $this->belongsTo(Bundling::class);
    }

    public function itemable(): MorphTo
    {
        return $this->morphTo();
    }
}
