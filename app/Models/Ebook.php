<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ebook extends Model
{
    protected $fillable = [
        'user_id',
        'nama',
        'url',
        'tipe_pembayaran',
        'harga',
        'harga_coret',
        'deskripsi',
        'cover',
        'tanggal_mulai_jual',
        'tanggal_kadaluarsa',
        'catatan',
        'max_pembayaran',
        'sumber_file',
        'file_url',
        'bisa_didownload',
        'author',
        'isbn',
        'format',
        'bahasa',
        'jumlah_halaman',
        'tanggal_publish',
        'affiliate_enabled',
        'status',
        'terjual'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
