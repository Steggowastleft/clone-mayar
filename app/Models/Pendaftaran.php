<?php
// ══════════════════════════════════════════════════
// app/Models/Pendaftaran.php
// ══════════════════════════════════════════════════
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pendaftaran extends Model
{
    protected $table = 'pendaftaran';

    protected $fillable = [
        'peserta_id',
        'registrable_id',
        'registrable_type',
        'status',
        'form_data',
        'harga_bayar',
        'tanggal_daftar',
        'tanggal_aktif',
        'tanggal_expired',
    ];

    protected $casts = [
        'form_data' => 'array',
        'tanggal_daftar' => 'datetime',
        'tanggal_aktif' => 'datetime',
        'tanggal_expired' => 'datetime',
    ];

    // 🔥 polymorphic target
    public function registrable()
    {
        return $this->morphTo();
    }

    public function peserta()
    {
    return $this->belongsTo(\App\Models\Peserta::class, 'peserta_id', 'id');
    }
}

// ══════════════════════════════════════════════════
// TAMBAHKAN ke config/auth.php
// Di bagian 'guards' dan 'providers':
// ══════════════════════════════════════════════════

/*
'guards' => [
    'web' => [
        'driver'   => 'session',
        'provider' => 'users',
    ],

    // Guard untuk peserta (terpisah dari admin)
    'peserta' => [
        'driver'   => 'session',
        'provider' => 'peserta',
    ],
],

'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model'  => App\Models\User::class,
    ],

    // Provider untuk peserta
    'peserta' => [
        'driver' => 'eloquent',
        'model'  => App\Models\Peserta::class,
    ],
],
*/