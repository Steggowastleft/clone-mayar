<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KustomForm extends Model
{
    protected $table = 'kustom_forms';

    protected $fillable = [
        'bootcamp_id',
        'fields',       // JSON array of field objects
        'is_applied',
    ];

    protected $casts = [
        'fields'     => 'array',
        'is_applied' => 'boolean',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }
}