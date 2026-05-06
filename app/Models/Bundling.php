<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Bundling extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'harga',
        'harga_coret',
        'cover',
        'deskripsi',
        'tipe_pembayaran',
        'tanggal_kadaluarsa',
        'pesan_setelah_bayar',
        'maksimal_pembayaran',
        'redirect_url',
        'status',
        'bisa_affiliate',
    ];

    protected $casts = [
        'tanggal_kadaluarsa' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'harga' => 'decimal:2',
        'harga_coret' => 'decimal:2',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BundlingItem::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(BundlingRegistration::class);
    }

    // Accessors
    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover ? Storage::url($this->cover) : null;
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeActive($query)
    {
        return $query->published()
            ->where(function ($q) {
                $q->whereNull('tanggal_kadaluarsa')
                  ->orWhere('tanggal_kadaluarsa', '>', now());
            });
    }

    public function isAvailable(): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        if ($this->tanggal_kadaluarsa && $this->tanggal_kadaluarsa->isPast()) {
            return false;
        }

        if ($this->maksimal_pembayaran && $this->jumlah_terjual >= $this->maksimal_pembayaran) {
            return false;
        }

        return true;
    }
}
