<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tulisan extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'url',
        'tipe_tulisan',
        'tipe_pembayaran',
        'mekanisme_bayar',
        'harga',
        'deskripsi',
        'cover',
        'tanggal_mulai_jual',
        'tanggal_kadaluarsa',
        'catatan',
        'max_pembayaran',
        'genre',
        'author',
        'bahasa',
        'affiliate_enabled',
        'status',
        'terjual'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
