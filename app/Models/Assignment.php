<?php
// ── app/Models/Assignment.php ─────────────────────────────────────────────
 
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class Assignment extends Model
{
    protected $table = 'assignments';
 
    protected $fillable = [
        'bootcamp_id', 'judul', 'tugas', 'tipe', 'is_tugas_akhir',
        'is_wajib', 'tanggal_mulai', 'tanggal_akhir',
    ];
 
    protected $casts = [
        'is_wajib'      => 'boolean',
        'is_tugas_akhir' => 'boolean',
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
 
    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
 
    public function soals()
    {
        return $this->hasMany(\App\Models\Soal::class)->orderBy('urutan');
    }
}