<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AssignmentFile extends Model
{
    protected $table = 'assignment_files';

    protected $fillable = ['assignment_id', 'name', 'path', 'size'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}