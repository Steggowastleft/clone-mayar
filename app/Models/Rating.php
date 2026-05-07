<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'bootcamp_id', // keeping for compatibility
        'peserta_id',
        'rateable_id',
        'rateable_type',
        'bintang',
        'ulasan',
        'tampil_anonim',
        'foto_url',
    ];

    protected $casts = [
        'tampil_anonim' => 'boolean',
        'bintang'       => 'integer',
    ];

    /**
     * Polymorphic relationship to any product.
     */
    public function rateable()
    {
        return $this->morphTo();
    }

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }
}