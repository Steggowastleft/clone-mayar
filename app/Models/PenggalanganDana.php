<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenggalanganDana extends Model
{
    protected $table = 'penggalangan_danas';

    protected $fillable = [
        'user_id',
        'tipe',
        'nama',
        'deskripsi',
        'kategori',
        'jenis_hewan',
        'harga',
        'harga_coret',
        'minimal_donasi',
        'stok',
        'status',
        'terkumpul',
        'pembeli',
        'tanggal_mulai_jual',
        'tanggal_tutup',
        'tujuan',
        'penerima_manfaat',
        'rincian_penggunaan',
        'catatan',
        'redirect_url',
        'tampilkan_target',
        'tampilkan_pencairan',
        'affiliate_enabled',
        'cover',
    ];

    protected $casts = [
        'tanggal_mulai_jual'    => 'datetime',
        'tanggal_tutup'         => 'datetime',
        'affiliate_enabled'     => 'boolean',
        'tampilkan_target'      => 'boolean',
        'tampilkan_pencairan'   => 'boolean',
        'harga'                 => 'integer',
        'harga_coret'           => 'integer',
        'minimal_donasi'        => 'integer',
        'terkumpul'             => 'integer',
        'pembeli'               => 'integer',
        'stok'                  => 'integer',
    ];

    protected $appends = [
        'cover_url',
        'progress_percent',
        'remaining_stock',
    ];

    /**
     * URL cover lengkap.
     */
    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover ? asset('storage/' . $this->cover) : null;
    }

    /**
     * Apakah penjualan masih dibuka?
     */
    public function isSalesOpen(): bool
    {
        $now = now();

        if ($this->status !== 'published') return false;
        if ($this->tanggal_mulai_jual && $now->lt($this->tanggal_mulai_jual)) return false;
        if ($this->tanggal_tutup && $now->gt($this->tanggal_tutup)) return false;

        // Untuk qurban, check stok
        if ($this->tipe === 'qurban' && $this->stok !== null && $this->pembeli >= $this->stok) {
            return false;
        }

        return true;
    }

    /**
     * Persentase target tercapai.
     */
    public function getProgressPercentAttribute(): float
    {
        if ($this->harga <= 0) return 0;
        return min(100, ($this->terkumpul / $this->harga) * 100);
    }

    /**
     * Apakah stok masih tersedia (untuk qurban).
     */
    public function isStockAvailable(): bool
    {
        if ($this->tipe !== 'qurban') return true;
        if ($this->stok === null) return true;
        return $this->pembeli < $this->stok;
    }

    /**
     * Sisa stok (untuk qurban).
     */
    public function getRemainingStockAttribute(): ?int
    {
        if ($this->tipe !== 'qurban' || $this->stok === null) return null;
        return max(0, $this->stok - $this->pembeli);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pendaftaran()
    {
        return $this->morphMany(Pendaftaran::class, 'registrable');
    }

    
}
