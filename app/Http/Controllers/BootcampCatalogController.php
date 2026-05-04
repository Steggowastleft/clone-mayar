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
                'id' => "bootcamp:{$b->id}",
                'product_id' => $b->id,
                'type' => 'bootcamp',
                'nama' => $b->name,
                'harga' => $b->harga ?? 0,
                'status' => $b->status,
                'tanggal' => $b->created_at->format('d M Y H:i'),
                'terjual' => $b->pendaftaran()->count(),
                'kategori' => 'Kelas Online',
            ]);

        return Inertia::render('bootcamps/catalog', [
            'produk' => $bootcamps
        ]);
    }
}