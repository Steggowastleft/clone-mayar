<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\KelasOnline;
use App\Models\KelasOnlinePeserta;
use Illuminate\Support\Facades\Auth;

class KelasOnlineCatalogController extends Controller
{
    public function index()
    {
        $query = KelasOnline::query()
            ->with('instruktur')
            ->where('status', 'published')
            ->latest();

        $peserta = Auth::guard('peserta')->user();
        if ($peserta) {
            $registeredIds = KelasOnlinePeserta::where('peserta_id', $peserta->id)
                ->whereIn('status', ['aktif', 'active', 'completed'])
                ->pluck('kelas_online_id')
                ->toArray();
            
            $query->whereNotIn('id', $registeredIds);
        }

        $kelasOnlineList = $query->get()
            ->map(fn($k) => [
                'id' => $k->id,
                'name' => $k->nama,
                'deskripsi' => $k->deskripsi,
                'harga' => $k->harga ?? 0,
                'is_free' => $k->is_gratis || $k->harga == 0,
                'cover_url' => $k->thumbnail ? asset('storage/' . $k->thumbnail) : null,
                'peserta_count' => $k->pesertaTerdaftar()->count(),
                'status' => $k->status,
                'instruktur' => $k->instruktur->pluck('nama')->implode(', '),
                'syarat_ketentuan' => $k->syarat_ketentuan,
            ]);

        return Inertia::render('kelas-online/katalog', [
            'kelasOnlineList' => $kelasOnlineList
        ]);
    }
}
