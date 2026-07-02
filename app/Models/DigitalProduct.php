<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class DigitalProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'digital_products';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image',
        'content_type',
        'content',
        'file_urls',
        'harga',
        'status',
    ];

    protected $casts = [
        'file_urls' => 'array',
        'harga' => 'integer',
    ];

    // ─── Boot ────────────────────────────────────────────────────────

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->title) . '-' . Str::random(6);
            }
        });
    }
}
