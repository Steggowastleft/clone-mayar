<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BundlingRegistration extends Model
{
    protected $fillable = [
        'bundling_id',
        'peserta_id',
        'nama',
        'email',
        'no_wa',
        'custom_fields',
        'status_pembayaran',
        'harga',
        'tanggal_pembayaran',
        'referral_code',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'tanggal_pembayaran' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'harga' => 'decimal:2',
    ];

    // Relationships
    public function bundling(): BelongsTo
    {
        return $this->belongsTo(Bundling::class);
    }

    public function peserta(): BelongsTo
    {
        return $this->belongsTo(User::class, 'peserta_id');
    }
}
