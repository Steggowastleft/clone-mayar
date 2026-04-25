<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CoachingMentoring extends Model
{
    use HasFactory;

    protected $table = 'coaching_mentorings';

    protected $fillable = [
        'user_id',
        'nama',
        'deskripsi',
        'booking_url',
        'tipe_pembayaran',
        'harga',
        'harga_coret',
        'cover',
        'waktu_mulai_jual',
        'tanggal_kadaluarsa',
        'max_pembayaran',
        'instruksi',
        'syarat_ketentuan',
        'bisa_affiliate',
        'status',
        'total_penjualan',
    ];

    protected $casts = [
        'harga' => 'integer',
        'harga_coret' => 'integer',
        'max_pembayaran' => 'integer',
        'total_penjualan' => 'integer',
        'bisa_affiliate' => 'boolean',
        'waktu_mulai_jual' => 'datetime',
        'tanggal_kadaluarsa' => 'date',
    ];

    /**
     * Get the user that owns the coaching/mentoring session
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if booking quota is reached
     */
    public function isQuotaReached(): bool
    {
        return $this->max_pembayaran !== null && $this->total_penjualan >= $this->max_pembayaran;
    }

    /**
     * Check if currently on sale
     */
    public function isOnSale(): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        if ($this->waktu_mulai_jual && now() < $this->waktu_mulai_jual) {
            return false;
        }

        if ($this->tanggal_kadaluarsa && now()->date() > $this->tanggal_kadaluarsa) {
            return false;
        }

        return !$this->isQuotaReached();
    }
}
