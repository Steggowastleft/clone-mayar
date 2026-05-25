<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Bootcamp extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'batch',
        'status',
        'date',
        'participants',
        'kategori',
        'tipe_pembayaran',
        'harga',
        'harga_coret',
        'deskripsi',
        'instruksi',
        'syarat_ketentuan',
        'cover',
        'max_peserta',
        'batas_nilai_quiz',
        'redirect_url',
        'bisa_affiliate',
        'tanggal_mulai_jual',
        'tanggal_tutup_daftar',
        'tanggal_mulai_pembelajaran',
        'tanggal_batas_pembelajaran',
    ];

    protected $casts = [
        'bisa_affiliate'             => 'boolean',
        'harga'                      => 'decimal:2',
        'harga_coret'                => 'decimal:2',
        'tanggal_mulai_jual'         => 'date:Y-m-d',
        'tanggal_tutup_daftar'       => 'date:Y-m-d',
        'tanggal_mulai_pembelajaran' => 'date:Y-m-d',
        'tanggal_batas_pembelajaran' => 'date:Y-m-d',
    ];

    // Append cover URL (bukan path storage)
    protected $appends = ['cover_url'];

    public function getCoverUrlAttribute(): ?string
    {
        if (!$this->cover) return null;
        return Storage::url($this->cover);
    }

    public function sesis()
    {
        return $this->hasMany(\App\Models\Sesi::class)->orderBy('waktu_mulai');
    }

    public function babs()
    {
        return $this->hasMany(\App\Models\Bab::class)->orderBy('urutan');
    }

    public function assignments()
    {
        return $this->hasMany(\App\Models\Assignment::class)->orderBy('tanggal_mulai');
    }

    public function instruktur()
    {
        return $this->hasMany(\App\Models\Instruktur::class)->orderBy('urutan');
    }

    public function landingContents()
    {
        return $this->hasMany(\App\Models\LandingContent::class);
    }

    public function testimoni()
    {
        return $this->hasMany(\App\Models\Testimoni::class)->orderBy('urutan');
    }

    public function kustomForm()
    {
        return $this->hasOne(\App\Models\Kustomform::class);
    }

    // 🔥 Polymorphic: Bootcamp bisa didaftari peserta
    public function pendaftaran()
    {
        return $this->morphMany(Pendaftaran::class, 'registrable');
    }

    public function ratings()
    {
        return $this->hasMany(\App\Models\Rating::class);
    }

    public function pembayaran()
    {
        return $this->hasMany(\App\Models\Pembayaran::class);
    }

    public function sertifikat()
    {
        return $this->hasMany(\App\Models\Sertifikat::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
