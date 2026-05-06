<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventPembicara extends Model
{
    protected $fillable = [
        'event_id',
        'nama',
        'pekerjaan',
        'profil',
        'foto',
    ];

    protected $appends = ['foto_url'];

    public function getFotoUrlAttribute()
    {
        return $this->foto ? asset('storage/' . $this->foto) : null;
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
