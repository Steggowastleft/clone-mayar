<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nama',
        'deskripsi',
        'tipe',
        'lokasi',
        'lokasi_map',
        'cover',
        'cover_url',
        'waktu_mulai',
        'waktu_selesai',
        'waktu_mulai_jual',
        'tanggal_tutup_daftar',
        'max_tiket_per_transaksi',
        'instruksi',
        'syarat_ketentuan',
        'redirect_url',
        'bisa_affiliate',
        'status',
    ];

    protected $casts = [
        'waktu_mulai'             => 'datetime',
        'waktu_selesai'           => 'datetime',
        'waktu_mulai_jual'        => 'datetime',
        'tanggal_tutup_daftar'    => 'date',
        'max_tiket_per_transaksi' => 'integer',
        'bisa_affiliate'          => 'boolean',
    ];

    // ─── Accessors ───────────────────────────────────────
    /**
     * Full public URL for the cover image.
     */
    public function getCoverUrlAttribute(): ?string
    {
        if ($this->attributes['cover_url'] ?? null) {
            return $this->attributes['cover_url'];
        }

        if ($cover = $this->attributes['cover'] ?? null) {
            return Storage::url($cover);
        }

        return null;
    }

public function pendaftaran()
{
    return $this->morphMany(\App\Models\Pendaftaran::class, 'registrable');
}

public function getParticipantsAttribute(): int
{
    return $this->pendaftaran()->count();
}

    // ─── Relationships ────────────────────────────────────
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    

    public function tiket(): HasMany
    {
        return $this->hasMany(EventTiket::class);
    }

    public function pembicaras(): HasMany
    {
        return $this->hasMany(EventPembicara::class);
    }

    // ─── Scopes ──────────────────────────────────────────
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ─── Helpers ─────────────────────────────────────────
    public function isOpen(): bool
    {
        $now = now();

        // Cek apakah penjualan sudah dibuka
        if ($this->waktu_mulai_jual && $now->lt($this->waktu_mulai_jual)) {
            return false;
        }

        // Cek apakah pendaftaran sudah ditutup
        if ($this->tanggal_tutup_daftar && $now->gt($this->tanggal_tutup_daftar)) {
            return false;
        }

        // Tutup otomatis setelah event dimulai (jika tidak ada tanggal tutup)
        if (! $this->tanggal_tutup_daftar && $now->gt($this->waktu_mulai)) {
            return false;
        }

        return true;
    }

    public function ratings()
    {
        return $this->morphMany(\App\Models\Rating::class, 'rateable');
    }
}