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
            ->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'deskripsi' => $b->deskripsi,
                'harga' => $b->harga ?? 0,
                'is_free' => $b->harga == 0,
                'cover_url' => $b->cover_url,
                'peserta_count' => $b->pendaftaran()->count(),
                'status' => $b->status,
            ]);

        return Inertia::render('bootcamps/katalog', [
            'bootcamps' => $bootcamps
        ]);
    }
}