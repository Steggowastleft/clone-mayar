<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KelasOnlineMeeting extends Model
{
    protected $table = 'kelas_online_meetings';

    protected $fillable = [
        'kelas_online_id',
        'judul',
        'deskripsi',
        'link_zoom',
        'nama_pemateri',
        'profil_pemateri',
        'waktu_mulai',
        'waktu_selesai',
    ];

    protected $casts = [
        'waktu_mulai'   => 'datetime',
        'waktu_selesai' => 'datetime',
    ];

    public function kelasOnline(): BelongsTo
    {
        return $this->belongsTo(KelasOnline::class, 'kelas_online_id');
    }
}
