<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Soal extends Model
{
    protected $fillable = [
        'assignment_id',
        'pertanyaan',
        'image',
        'show_image',
        'tipe_soal',
        'pilihan',
        'jawaban_benar',
        'urutan',
    ];

    protected $casts = [
        'pilihan'    => 'array',
        'show_image' => 'boolean',
    ];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}