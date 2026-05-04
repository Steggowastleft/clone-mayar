<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

// ================================================================
// MODEL: KelasOnlineSertifikat
// ================================================================
class KelasOnlineSertifikat extends Model
{
    protected $table = 'kelas_online_sertifikats';

    protected $fillable = [
        'kelas_online_id', 'peserta_id', 'status',
        'nomor_sertifikat', 'qr_token', 'file_sertifikat',
        'approved_by', 'is_manual_approved',
        'approved_at', 'catatan_approval',
    ];

    protected $casts = [
        'is_manual_approved' => 'boolean',
        'approved_at'        => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $model) {
            if (empty($model->qr_token)) {
                $model->qr_token = Str::uuid()->toString();
            }
        });
    }

    public function kelasOnline(): BelongsTo
    {
        return $this->belongsTo(KelasOnline::class, 'kelas_online_id');
    }

    public function peserta(): BelongsTo
    {
        return $this->belongsTo(Peserta::class, 'peserta_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isValid(): bool
    {
        return in_array($this->status, ['approved', 'manual_approved']);
    }

    public function getVerifikasiUrlAttribute(): string
    {
        return route('kelas-online.sertifikat.verify', $this->qr_token);
    }
}