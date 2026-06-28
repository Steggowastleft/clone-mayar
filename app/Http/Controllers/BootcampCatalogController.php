<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bootcamp;
use App\Models\Pendaftaran;
use Illuminate\Support\Facades\Auth;

class BootcampCatalogController extends Controller
{
    public function index()
    {
        $query = Bootcamp::query()
            ->where('status', 'published')
            ->latest();

        $peserta = Auth::guard('peserta')->user();
        if ($peserta) {
            $registeredIds = Pendaftaran::where('peserta_id', $peserta->id)
                ->where('registrable_type', Bootcamp::class)
                ->whereIn('status', ['aktif', 'active', 'completed'])
                ->pluck('registrable_id')
                ->toArray();
            
            $query->whereNotIn('id', $registeredIds);
        }

        $bootcamps = $query->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'deskripsi' => $b->deskripsi,
                'harga' => $b->harga ?? 0,
                'is_free' => $b->harga == 0,
                'cover_url' => $b->cover_url,
                'peserta_count' => $b->pendaftaran()->count(),
                'status' => $b->status,
                'syarat_ketentuan' => $b->syarat_ketentuan,
            ]);

        return Inertia::render('bootcamps/katalog', [
            'bootcamps' => $bootcamps
        ]);
    }
}