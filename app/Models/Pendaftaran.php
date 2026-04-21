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
        'bootcamp_id', 'peserta_id', 'status',
        'form_data', 'harga_bayar',
        'tanggal_aktif', 'tanggal_expired',
    ];

    protected $casts = [
        'form_data'        => 'array',
        'harga_bayar'      => 'decimal:2',
        'tanggal_aktif'    => 'datetime',
        'tanggal_expired'  => 'datetime',
        'tanggal_daftar'   => 'datetime',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
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