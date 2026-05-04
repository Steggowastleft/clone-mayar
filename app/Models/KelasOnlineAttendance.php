<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// ================================================================
// MODEL: KelasOnlineAttendance
// ================================================================
class KelasOnlineAttendance extends Model
{
    protected $table = 'kelas_online_attendances';

    protected $fillable = [
        'kelas_online_id', 'sesi_id', 'peserta_id',
        'attendance_type', 'file_bukti', 'file_nama_asli',
        'status', 'keterangan', 'uploaded_at', 'is_late',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'is_late'     => 'boolean',
    ];

    public function kelasOnline(): BelongsTo
    {
        return $this->belongsTo(KelasOnline::class, 'kelas_online_id');
    }

    public function sesi(): BelongsTo
    {
        return $this->belongsTo(KelasOnlineSesi::class, 'sesi_id');
    }

    public function peserta(): BelongsTo
    {
        return $this->belongsTo(Peserta::class, 'peserta_id');
    }

    public function getLabelTipeAttribute(): string
    {
        return match ($this->attendance_type) {
            'awal'   => '🌅 Presensi Awal',
            'tengah' => '☀️ Presensi Tengah',
            'akhir'  => '🌙 Presensi Akhir',
            default  => 'Presensi',
        };
    }
}