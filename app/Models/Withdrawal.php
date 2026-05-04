<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    protected $fillable = [
        'user_id',
        'jumlah',
        'metode_pembayaran', // bank_transfer, ewallet, etc
        'nomor_rekening',
        'nama_pemilik_rekening',
        'bank_name',
        'status', // pending, approved, rejected, completed
        'catatan',
        'admin_notes',
        'tanggal_permohonan',
        'tanggal_approval',
        'tanggal_selesai',
        'approved_by',
    ];

    protected $casts = [
        'jumlah'              => 'decimal:2',
        'tanggal_permohonan'  => 'datetime',
        'tanggal_approval'    => 'datetime',
        'tanggal_selesai'     => 'datetime',
    ];

    /**
     * Relasi ke User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Admin yang approve
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
