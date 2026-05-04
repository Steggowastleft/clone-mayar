<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Instruktur extends Model
{
    protected $table = 'instruktur';

    protected $fillable = [
        'bootcamp_id', 'kelas_online_id', 'nama', 'jabatan', 'bio', 'foto', 'urutan',
    ];

    protected $appends = ['foto_url'];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function getFotoUrlAttribute(): ?string
    {
        if (!$this->foto) return null;
        return Storage::url($this->foto);
    }

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function kelasOnline()
    {
        return $this->belongsTo(KelasOnline::class, 'kelas_online_id');
    }
}