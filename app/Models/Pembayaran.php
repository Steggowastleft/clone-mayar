<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    protected $fillable = [
        'bootcamp_id',
        'nama_pembeli',
        'email_pembeli',
        'no_hp_pembeli',
        'jumlah',
        'bukti_transfer',
        'catatan',
        'status',
        'order_id',
        'peserta_id',
        'confirmed_at',
        'coupon_code',
    ];

    protected $casts = [
        'jumlah'       => 'decimal:2',
        'confirmed_at' => 'datetime',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }
}