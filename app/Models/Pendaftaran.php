<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $table = 'pendaftaran';

    protected $fillable = [
        'peserta_id',
        'registrable_id',
        'registrable_type',
        'status',
        'form_data',
        'harga_bayar',
        'tanggal_daftar',
        'tanggal_aktif',
        'tanggal_expired',
    ];

    protected $casts = [
        'form_data'        => 'array',
        'tanggal_daftar'   => 'datetime',
        'tanggal_aktif'    => 'datetime',
        'tanggal_expired'  => 'datetime',
    ];

    // 🔥 Polymorphic target — bisa ke Bootcamp, Webinar, Event, dll.
    public function registrable()
    {
        return $this->morphTo();
    }

    public function peserta()
    {
        return $this->belongsTo(\App\Models\Peserta::class, 'peserta_id', 'id');
    }
}