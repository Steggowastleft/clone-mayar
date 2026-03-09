<?php
// ── app/Models/Assignment.php ─────────────────────────────────────────────

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $table = 'assignments';

    protected $fillable = [
        'bootcamp_id', 'judul', 'tugas',
        'is_wajib', 'tanggal_mulai', 'tanggal_akhir',
    ];

    protected $casts = [
        'is_wajib'      => 'boolean',
        'tanggal_mulai' => 'date',
        'tanggal_akhir' => 'date',
    ];

    public function bootcamp()
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function files()
    {
        return $this->hasMany(AssignmentFile::class);
    }
}
