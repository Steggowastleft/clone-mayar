<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PaymentLink extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nama',
        'harga',
        'harga_coret',
        'deskripsi',
        'cover',
        'cover_url',
        'waktu_mulai_jual',
        'tanggal_kadaluarsa',
        'pesan_setelah_bayar',
        'maksimum_pembayaran',
        'redirect_url',
        'bisa_affiliate',
        'status',
        'slug',
    ];

    protected $casts = [
        'bisa_affiliate'    => 'boolean',
        'waktu_mulai_jual'  => 'datetime',
        'tanggal_kadaluarsa'=> 'date',
        'harga'             => 'integer',
        'harga_coret'       => 'integer',
        'maksimum_pembayaran'=> 'integer',
    ];

    // ─── Relationships ───────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ─── Boot: auto-generate slug ────────────────────
    protected static function booted(): void
    {
        static::creating(function (self $model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->nama) . '-' . Str::random(6);
            }
        });
    }

    // ─── Helpers ─────────────────────────────────────
    public function isExpired(): bool
    {
        return $this->tanggal_kadaluarsa && $this->tanggal_kadaluarsa->isPast();
    }

    public function isOnSale(): bool
    {
        if ($this->waktu_mulai_jual && $this->waktu_mulai_jual->isFuture()) {
            return false;
        }
        return !$this->isExpired();
    }
}