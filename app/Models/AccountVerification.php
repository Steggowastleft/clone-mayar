<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountVerification extends Model
{
    use HasFactory;

    protected $table = 'account_verifications';

    protected $fillable = [
        'user_id',
        'verification_type',
        'legal_name',
        'id_number',
        'business_name',
        'business_description',
        'business_address',
        'website',
        'status',
        'decline_reason',
        'reviewed_by',
        'reviewed_at',
        'submitted_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function documents()
    {
        return $this->hasMany(AccountVerificationDocument::class, 'verification_id');
    }
}
