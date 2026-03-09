<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingContent extends Model
{
    protected $table = 'landing_contents';

    protected $fillable = [
        'bootcamp_id', 'section', 'konten',
    ];

    protected $casts = [
        'konten' => 'array', // otomatis encode/decode JSON
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }
}