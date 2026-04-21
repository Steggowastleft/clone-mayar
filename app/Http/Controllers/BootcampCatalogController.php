<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bootcamp;

class BootcampCatalogController extends Controller
{
    public function index()
    {
        $bootcamps = Bootcamp::query()
            ->where('status', 'published')
            ->latest()
            ->get()
            ->map(function ($bootcamp) {
                return [
                    'id'            => $bootcamp->id,
                    'name'          => $bootcamp->name,
                    'deskripsi'     => $bootcamp->deskripsi,
                    'harga'         => $bootcamp->harga,
                    'is_free'       => $bootcamp->harga == 0,
                    'cover_url'     => $bootcamp->cover_url,
                    'peserta_count' => $bootcamp->pendaftaran()->count(),
                    'omset'         => $bootcamp->pendaftaran()->sum('harga_bayar'),
                    'status'        => $bootcamp->status,
                ];
            });

        return Inertia::render('bootcamps/katalog', [
            'bootcamps' => $bootcamps
        ]);
    }
}