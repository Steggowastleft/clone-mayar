<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $table = 'attendances';

    protected $fillable = [
        'sesi_id',
        'peserta_id',
        'attendance_type',
        'file_bukti',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get sesi yang terkait dengan attendance
     */
    public function sesi(): BelongsTo
    {
        return $this->belongsTo(Sesi::class);
    }

    /**
     * Get peserta yang terkait dengan attendance
     */
    public function peserta(): BelongsTo
    {
        return $this->belongsTo(Peserta::class);
    }

    /**
     * Cek apakah attendance sudah diapprove
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Approve attendance
     */
    public function approve(): void
    {
        $this->update(['status' => 'approved']);
    }

    /**
     * Reject attendance
     */
    public function reject(string $keterangan = ''): void
    {
        $this->update([
            'status' => 'rejected',
            'keterangan' => $keterangan,
        ]);
    }
}
