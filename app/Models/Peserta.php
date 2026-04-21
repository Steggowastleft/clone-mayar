<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class Peserta extends Authenticatable
{
    use Notifiable;

    protected $table = 'peserta';

    protected $fillable = [
        'nama', 'email', 'no_hp', 'password', 'foto',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    protected $appends = ['foto_url'];

    public function getFotoUrlAttribute(): ?string
    {
        if (!$this->foto) return null;
        return Storage::url($this->foto);
    }

    public function pendaftaran()
    {
        return $this->hasMany(Pendaftaran::class);
    }

    public function bootcamps()
    {
        return $this->belongsToMany(Bootcamp::class, 'pendaftaran')
            ->withPivot(['status', 'form_data', 'harga_bayar', 'tanggal_aktif', 'tanggal_expired'])
            ->withTimestamps();
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class);
    }

    public function sertifikat()
    {
        return $this->hasMany(Sertifikat::class);
    }
}