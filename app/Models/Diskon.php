<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diskon extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'untuk_produk',
        'produk_ids',
        'tipe_diskon',
        'besaran',
        'minimum_pembelian',
        'tipe_kupon',
        'untuk_pelanggan',
        'kode_kupon',
        'batas_pemakaian',
        'batas_per_orang',
        'waktu_mulai',
        'tanggal_kadaluarsa',
        'status',
        'jumlah_dipakai',
    ];

    protected $casts = [
        'produk_ids' => 'array',
        'besaran' => 'decimal:2',
        'minimum_pembelian' => 'decimal:2',
        'waktu_mulai' => 'datetime',
        'tanggal_kadaluarsa' => 'datetime',
        'batas_pemakaian' => 'integer',
        'batas_per_orang' => 'integer',
        'jumlah_dipakai' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isAktif(): bool
    {
        if ($this->status !== 'aktif') {
            return false;
        }

        $now = now();

        // Check if started
        if ($this->waktu_mulai && $now->lt($this->waktu_mulai)) {
            return false;
        }

        // Check if expired
        if ($this->tanggal_kadaluarsa && $now->gt($this->tanggal_kadaluarsa)) {
            return false;
        }

        // Check usage limit
        if ($this->batas_pemakaian && $this->jumlah_dipakai >= $this->batas_pemakaian) {
            return false;
        }

        return true;
    }

    public function getProdukTerpilihAttribute(): array
    {
        return $this->produk_ids ?? [];
    }
}
