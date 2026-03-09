<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimoni extends Model
{
    protected $table = 'testimoni';

    protected $fillable = [
        'bootcamp_id', 'nama', 'profesi', 'isi', 'rating', 'urutan',
    ];

    protected $casts = [
        'rating' => 'integer',
        'urutan' => 'integer',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }
}