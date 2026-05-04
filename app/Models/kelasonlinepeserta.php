<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// ================================================================
// MODEL: KelasOnlinePeserta (Enrollment)
// ================================================================
class KelasOnlinePeserta extends Model
{
    protected $table = 'kelas_online_peserta';

    protected $fillable = [
        'kelas_online_id', 'peserta_id', 'status', 'mendaftar_pada',
    ];

    protected $casts = [
        'mendaftar_pada' => 'datetime',
    ];

    public function kelasOnline(): BelongsTo
    {
        return $this->belongsTo(KelasOnline::class, 'kelas_online_id');
    }

    public function peserta(): BelongsTo
    {
        // Sesuaikan dengan model Peserta yang sudah ada di project
        return $this->belongsTo(Peserta::class, 'peserta_id');
    }
}