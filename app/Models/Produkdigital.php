<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Produkdigital extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'produk_digitals';

    protected $fillable = [
        'user_id',
        'nama',
        'deskripsi',
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
        // fields from add_specific_fields migration
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
        // fields from add_podcast_and_komik_fields migration
        'content_type',
        'content',
        'file_urls',
        // reading_time if exists
        'reading_time',
    ];

    protected $casts = [
        'file_urls'        => 'array',
        'harga'            => 'integer',
        'harga_coret'      => 'integer',
        'bisa_affiliate'   => 'boolean',
        'bisa_didownload'  => 'boolean',
        'jumlah_halaman'   => 'integer',
        'total_penjualan'  => 'integer',
        'max_pembayaran'   => 'integer',
        'waktu_mulai_jual' => 'datetime',
        'tanggal_kadaluarsa' => 'date',
        'tanggal_publish'  => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->nama) . '-' . Str::random(6);
            }
        });
    }

    // ─── Relationships ──────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}