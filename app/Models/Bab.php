<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bab extends Model
{
    use HasFactory;

    protected $table = 'babs';

    protected $fillable = [
        'bootcamp_id',
        'kelas_online_id',
        'judul',
        'deskripsi',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function kelasOnline()
    {
        return $this->belongsTo(KelasOnline::class, 'kelas_online_id');
    }

    public function materis()
    {
        return $this->hasMany(Materi::class)->orderBy('urutan');
    }
}