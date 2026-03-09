<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materi extends Model
{
    use HasFactory;

    protected $table = 'materis';

    protected $fillable = [
        'bab_id',
        'judul',
        'tipe',
        'konten',
        'durasi',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function bab()
    {
        return $this->belongsTo(Bab::class);
    }
}