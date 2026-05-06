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
        'deskripsi',
        'waktu_mulai',
        'waktu_selesai',
    ];

    protected $casts = [
        'waktu_mulai' => 'datetime',
        'waktu_selesai' => 'datetime',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}