<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    protected $fillable = [
        'assignment_id',
        'pertanyaan',
        'tipe_soal',
        'pilihan',
        'jawaban_benar',
        'urutan',
    ];

    protected $casts = [
        'pilihan' => 'array',
    ];

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}