<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sertifikat extends Model
{
    protected $fillable = [
        'peserta_id',
        'bootcamp_id',
        'nomor_sertifikat',
        'nama_peserta',
        'nama_bootcamp',
        'nama_instruktur',
        'tanggal_selesai',
        'qr_token',
        'is_approved',
        'is_manual_approved',
        'approved_by',
        'approved_at',
        'approval_reason',
    ];

    protected $casts = [
        'tanggal_selesai' => 'date',
        'approved_at' => 'datetime',
        'is_approved' => 'boolean',
        'is_manual_approved' => 'boolean',
    ];

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }



    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }Public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    /**
     * Generate nomor sertifikat unik
     */
    public static function generateNomor(): string
    {
        do {
            $nomor = 'CERT-' . date('Y') . '-' . strtoupper(Str::random(6));
        } while (self::where('nomor_sertifikat', $nomor)->exists());

        return $nomor;
    }

    /**
     * Generate QR token unik
     */
    public static function generateQrToken(): string
    {
        do {
            $token = Str::random(32);
        } while (self::where('qr_token', $token)->exists());

        return $token;
    }

    /**
     * URL untuk verifikasi sertifikat
     */
    public function getVerifikasiUrlAttribute(): string
    {
        return url('/sertifikat/verify/' . $this->qr_token);
    }
}