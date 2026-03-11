<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $table = 'submissions';

    protected $fillable = [
        'assignment_id',
        'peserta_id',
        'submission_url',
        'submission_teks',
        'grade',
        'waktu_kirim',
    ];

    protected $casts = [
        'grade'      => 'integer',
        'waktu_kirim' => 'datetime',
    ];

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function peserta()
    {
        return $this->belongsTo(Peserta::class);
    }
}