<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\KelasOnline;

class KelasOnlineCatalogController extends Controller
{
    public function index()
    {
        $kelasOnlineList = KelasOnline::query()
            ->where('status', 'published')
            ->latest()
            ->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'name' => $k->nama,
                'deskripsi' => $k->deskripsi,
                'harga' => $k->harga ?? 0,
                'is_free' => $k->is_gratis || $k->harga == 0,
                'cover_url' => $k->thumbnail ? asset('storage/' . $k->thumbnail) : null,
                'peserta_count' => $k->pesertaTerdaftar()->count(),
                'status' => $k->status,
            ]);

        return Inertia::render('kelas-online/katalog', [
            'kelasOnlineList' => $kelasOnlineList
        ]);
    }
}
