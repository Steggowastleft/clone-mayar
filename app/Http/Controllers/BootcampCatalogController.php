<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bootcamp;

class BootcampCatalogController extends Controller
{
    public function index()
    {
        $bootcamps = Bootcamp::query()
            ->latest()
            ->get()
            ->map(function ($bootcamp) {
                return [
                    'id'            => $bootcamp->id,
                    'title'         => $bootcamp->title,
                    'description'   => $bootcamp->description,
                    'price'         => $bootcamp->price,
                    'is_free'       => $bootcamp->price == 0,
                    'thumbnail'     => $bootcamp->thumbnail ?? null,
                    'peserta_count' => $bootcamp->pendaftaran()->count(),
                    'omset'         => $bootcamp->pendaftaran()->sum('harga_bayar'),
                ];
            });

        return Inertia::render('bootcamps/katalog', [
    'bootcamps' => $bootcamps
]);
    }
}