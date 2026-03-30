<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgressMateri extends Model
{
    protected $fillable = [
        'peserta_id',
        'materi_id',
        'bootcamp_id',
        'dibaca_at',
    ];

    protected $casts = [
        'dibaca_at' => 'datetime',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }

    public function materi()
    {
        return $this->belongsTo(Materi::class);
    }

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }
}