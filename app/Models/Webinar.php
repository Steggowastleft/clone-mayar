<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Webinar extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'deskripsi',
        'url',
        'harga',
        'harga_coret',
        'status',
        'peserta',
        'max_peserta',
        'tanggal_mulai',
        'tanggal_selesai',
        'timezone',
        'tanggal_mulai_jual',
        'tanggal_tutup_daftar',
        'instruksi',
        'syarat_ketentuan',
        'redirect_url',
        'affiliate_enabled',
        'cover',
    ];

    protected $casts = [
        'tanggal_mulai'        => 'datetime',
        'tanggal_selesai'      => 'datetime',
        'tanggal_mulai_jual'   => 'datetime',
        'tanggal_tutup_daftar' => 'datetime',
        'affiliate_enabled'    => 'boolean',
        'harga'                => 'integer',
        'harga_coret'          => 'integer',
        'peserta'              => 'integer',
        'max_peserta'          => 'integer',
    ];

    /**
     * Apakah webinar sudah penuh?
     */
    public function isFull(): bool
    {
        return $this->max_peserta !== null && $this->peserta >= $this->max_peserta;
    }

    /**
     * Apakah pendaftaran masih dibuka?
     */
    public function isRegistrationOpen(): bool
    {
        $now = now();

        if ($this->status !== 'published') return false;
        if ($this->isFull()) return false;
        if ($this->tanggal_mulai_jual && $now->lt($this->tanggal_mulai_jual)) return false;
        if ($this->tanggal_tutup_daftar && $now->gt($this->tanggal_tutup_daftar)) return false;

        return true;
    }

    /**
     * URL cover lengkap.
     */
    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover ? asset('storage/' . $this->cover) : null;
    }
    public function pendaftaran()
    {
        return $this->morphMany(Pendaftaran::class, 'registrable');
    }

    public function pembicaras()
    {
        return $this->hasMany(WebinarPembicara::class)->latest();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

