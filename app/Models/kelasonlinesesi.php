<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// ================================================================
// MODEL: KelasOnlineSesi
// 3 sesi presensi per kelas: awal, tengah, akhir
// ================================================================
class KelasOnlineSesi extends Model
{
    protected $table = 'kelas_online_sesi';

    protected $fillable = [
        'kelas_online_id', 'tipe', 'judul',
        'is_aktif', 'dibuka_pada', 'ditutup_pada', 'batas_waktu',
    ];

    protected $casts = [
        'is_aktif'     => 'boolean',
        'dibuka_pada'  => 'datetime',
        'ditutup_pada' => 'datetime',
        'batas_waktu'  => 'datetime',
    ];

    public function kelasOnline(): BelongsTo
    {
        return $this->belongsTo(KelasOnline::class, 'kelas_online_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(KelasOnlineAttendance::class, 'sesi_id');
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->kelasOnline->user_id === $user->id;
    }

    public function getLabelAttribute(): string
    {
        return match ($this->tipe) {
            'awal'   => 'Presensi Awal Kelas',
            'tengah' => 'Presensi Tengah Kelas',
            'akhir'  => 'Presensi Akhir Kelas',
            default  => 'Presensi',
        };
    }
}