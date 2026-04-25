<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventTiket extends Model
{
    protected $fillable = [
        'event_id',
        'nama',
        'harga',
        'kuota',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}