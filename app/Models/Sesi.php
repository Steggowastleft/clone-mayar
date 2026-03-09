<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sesi extends Model
{
    use HasFactory;

    protected $table = 'sesis';

    protected $fillable = [
        'bootcamp_id',
        'judul',
        'deskripsi',
        'is_online',
        'link_sesi',
        'lokasi',
        'lat',
        'lng',
        'nama_pemateri',
        'profil_pemateri',
        'waktu_mulai',
        'waktu_selesai',
    ];

    protected $casts = [
        'is_online'    => 'boolean',
        'lat'          => 'float',
        'lng'          => 'float',
        'waktu_mulai'  => 'datetime',
        'waktu_selesai'=> 'datetime',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }
}