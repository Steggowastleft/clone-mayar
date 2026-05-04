<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenggalanganDanaKabar extends Model
{
    protected $fillable = [
        'penggalangan_dana_id',
        'judul',
        'deskripsi',
    ];

    public function penggalanganDana()
    {
        return $this->belongsTo(PenggalanganDana::class);
    }
}
