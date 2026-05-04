<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sesi extends Model
{
    use HasFactory;

    protected $table = 'sesis';

    protected $fillable = [
        'bootcamp_id',
        'owner_id',
        'judul',
        'deskripsi',
        'is_online',
        'link_sesi',
        'lokasi',
        'lat',
        'lng',
        'nama_pemateri',
        'profil_pemateri',
        'waktu_mulai',
        'waktu_selesai',
        'require_attendance',
        'has_assignment',
        'assignment_required_for_cert',
        'min_assignment_score',
    ];

    protected $casts = [
        'is_online'    => 'boolean',
        'lat'          => 'float',
        'lng'          => 'float',
        'waktu_mulai'  => 'datetime',
        'waktu_selesai'=> 'datetime',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get semua presensi awal yang sudah diapprove untuk sesi ini
     */
    public function attendancesAwal()
    {
        return $this->attendances()
            ->where('attendance_type', 'awal')
            ->where('status', 'approved');
    }

    /**
     * Get semua presensi tengah yang sudah diapprove
     */
    public function attendancesTengah()
    {
        return $this->attendances()
            ->where('attendance_type', 'tengah')
            ->where('status', 'approved');
    }

    /**
     * Get semua presensi akhir yang sudah diapprove
     */
    public function attendancesAkhir()
    {
        return $this->attendances()
            ->where('attendance_type', 'akhir')
            ->where('status', 'approved');
    }

    /**
     * Check apakah current user adalah owner sesi ini
     */
    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }
}