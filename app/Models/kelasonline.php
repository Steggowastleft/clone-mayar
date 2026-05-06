<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class KelasOnline extends Model
{
    use SoftDeletes;

    protected $table = 'kelas_online';

    protected $fillable = [
        'user_id', 'nama', 'deskripsi', 'thumbnail', 'slug',
        'harga', 'is_gratis', 'status',
        'require_quiz_sertifikat', 'nilai_minimum_quiz',
        'has_assignment',
        'materi_file', 'materi_nama_asli',
        'tanggal_mulai', 'tanggal_selesai',
    ];

    protected $casts = [
        'harga'                   => 'decimal:2',
        'is_gratis'               => 'boolean',
        'require_quiz_sertifikat' => 'boolean',
        'has_assignment'          => 'boolean',
        'tanggal_mulai'           => 'datetime',
        'tanggal_selesai'         => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->nama) . '-' . Str::random(6);
            }
        });
    }

    // ----------------------------------------------------------------
    // RELATIONS
    // ----------------------------------------------------------------
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sesi(): HasMany
    {
        return $this->hasMany(KelasOnlineSesi::class, 'kelas_online_id');
    }

    public function pesertaTerdaftar(): HasMany
    {
        return $this->hasMany(KelasOnlinePeserta::class, 'kelas_online_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'kelas_online_id');
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(KelasOnlineMeeting::class, 'kelas_online_id')->orderBy('waktu_mulai');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(KelasOnlineAttendance::class, 'kelas_online_id');
    }

    public function sertifikats(): HasMany
    {
        return $this->hasMany(KelasOnlineSertifikat::class, 'kelas_online_id');
    }

    public function babs(): HasMany
    {
        return $this->hasMany(Bab::class, 'kelas_online_id')->orderBy('urutan');
    }

    public function instruktur(): HasMany
    {
        return $this->hasMany(Instruktur::class, 'kelas_online_id')->orderBy('urutan');
    }

    // ----------------------------------------------------------------
    // HELPERS
    // ----------------------------------------------------------------
    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function isAktif(): bool
    {
        return $this->status === 'published';
    }
}