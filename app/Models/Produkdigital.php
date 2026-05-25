<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ProdukDigital extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'produk_digitals';

    protected $fillable = [
        'user_id',
        'nama',
        'deskripsi',
        'kategori',
        'slug',
        'tipe_pembayaran',
        'harga',
        'harga_coret',
        'sumber_file',
        'file_path',
        'file_url',
        'file_lama_id',
        'redirect_url',
        'cover',
        'cover_url',
        'waktu_mulai_jual',
        'tanggal_kadaluarsa',
        'catatan',
        'max_pembayaran',
        'bisa_affiliate',
        'status',
        'total_penjualan',
        
        // Specific Fields
        'author',
        'isbn',
        'format',
        'bahasa',
        'jumlah_halaman',
        'tanggal_publish',
        'bisa_didownload',
        'tipe_tulisan',
        'mekanisme_bayar',
        'genre',
        'transkrip',
        'pembicara',
        'durasi',
        'artis',
        'kategori_produk',
        'tipe_pembaca',
    ];

    protected $casts = [
        'harga'            => 'integer',
        'harga_coret'      => 'integer',
        'max_pembayaran'   => 'integer',
        'total_penjualan'  => 'integer',
        'bisa_affiliate'   => 'boolean',
        'waktu_mulai_jual' => 'datetime',
        'tanggal_kadaluarsa' => 'date',
    ];

    // ─── Relationships ───────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ─── Accessors ───────────────────────────────────────────────────

    public function getFormattedHargaAttribute(): string
    {
        return 'Rp ' . number_format($this->harga, 0, ',', '.');
    }

    public function getFormattedHargaCoretAttribute(): ?string
    {
        return $this->harga_coret
            ? 'Rp ' . number_format($this->harga_coret, 0, ',', '.')
            : null;
    }

    // ─── Boot ────────────────────────────────────────────────────────

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->nama) . '-' . Str::random(6);
            }
        });
    }
}