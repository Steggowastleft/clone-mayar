<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountVerificationDocument extends Model
{
    use HasFactory;

    protected $table = 'account_verification_documents';

    protected $fillable = [
        'verification_id',
        'document_type',
        'file_path',
        'original_name',
        'mime_type',
        'size',
    ];

    public function verification()
    {
        return $this->belongsTo(AccountVerification::class, 'verification_id');
    }
}
