<?php

namespace App\Policies;

use App\Models\Peserta;
use App\Models\DigitalProduct;
use App\Models\Pendaftaran;

class DigitalProductPolicy
{
    /**
     * Determine whether the peserta can view the digital product.
     */
    public function view(Peserta $peserta, DigitalProduct $digitalProduct): bool
    {
        return Pendaftaran::where('peserta_id', $peserta->id)
            ->where('registrable_type', DigitalProduct::class)
            ->where('registrable_id', $digitalProduct->id)
            ->whereIn('status', ['active', 'aktif', 'completed'])
            ->exists();
    }
}
