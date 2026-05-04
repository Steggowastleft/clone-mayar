<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebinarPembicara extends Model
{
    protected $fillable = [
        'webinar_id',
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

    public function webinar()
    {
        return $this->belongsTo(Webinar::class);
    }
}
