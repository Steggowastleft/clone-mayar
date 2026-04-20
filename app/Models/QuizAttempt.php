<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $fillable = [
        'assignment_id',
        'peserta_id',
        'jawaban',
        'nilai',
        'dikerjakan_at',
    ];

    protected $casts = [
        'jawaban'       => 'array',
        'dikerjakan_at' => 'datetime',
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