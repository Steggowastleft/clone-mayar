<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'bootcamp_id',
        'peserta_id',
        'bintang',
        'ulasan',
        'tampil_anonim',
        'foto_url',
    ];

    protected $casts = [
        'tampil_anonim' => 'boolean',
        'bintang'       => 'integer',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }
}