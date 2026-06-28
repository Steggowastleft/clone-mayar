<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Webinar;
use App\Models\Pendaftaran;
use Illuminate\Support\Facades\Auth;

class WebinarCatalogController extends Controller
{
    /**
     * Menampilkan katalog webinar yang dipublikasi
     */
    public function index()
    {
        $query = Webinar::query()
            ->with('pembicaras')
            ->where('status', 'published')
            ->latest();

        $peserta = Auth::guard('peserta')->user();
        if ($peserta) {
            $registeredIds = Pendaftaran::where('peserta_id', $peserta->id)
                ->where('registrable_type', Webinar::class)
                ->whereIn('status', ['aktif', 'active', 'completed'])
                ->pluck('registrable_id')
                ->toArray();
            
            $query->whereNotIn('id', $registeredIds);
        }

        $webinars = $query->get()
            ->map(fn($w) => [
                'id' => "webinar:{$w->id}",
                'product_id' => $w->id,
                'type' => 'webinar',
                'nama' => $w->nama,
                'harga' => $w->harga ?? 0,
                'status' => $w->status,
                'tanggal' => $w->created_at->format('d M Y H:i'),
                'terjual' => $w->peserta ?? 0,
                'kategori' => 'Webinar',
                'pembicara' => $w->pembicaras->pluck('nama')->implode(', '),
                'syarat_ketentuan' => $w->syarat_ketentuan,
            ]);

        return Inertia::render('webinar/catalog', [
            'produk' => $webinars
        ]);
    }

    /**
     * Menampilkan detail webinar dengan opsi untuk mendaftar
     */
    public function show(Webinar $webinar)
    {
        if ($webinar->status !== 'published') {
            abort(404);
        }

        $webinar->load('pembicaras');

        $webinarData = [
            'id'            => $webinar->id,
            'nama'          => $webinar->nama,
            'deskripsi'     => $webinar->deskripsi,
            'harga'         => $webinar->harga,
            'harga_coret'   => $webinar->harga_coret,
            'is_free'       => $webinar->harga == 0,
            'cover'         => $webinar->cover ? asset('storage/' . $webinar->cover) : null,
            'peserta_count' => $webinar->peserta ?? 0,
            'max_peserta'   => $webinar->max_peserta,
            'tanggal_mulai' => $webinar->tanggal_mulai,
            'tanggal_selesai' => $webinar->tanggal_selesai,
            'url'           => $webinar->url,
            'instruksi'     => $webinar->instruksi,
            'syarat_ketentuan' => $webinar->syarat_ketentuan,
            'status'        => $webinar->status,
            'is_full'       => $webinar->isFull(),
            'is_registration_open' => $webinar->isRegistrationOpen(),
            'user_id'       => $webinar->user_id,
            'pembicaras'    => $webinar->pembicaras->map(function ($p) {
                return [
                    'id' => $p->id,
                    'nama' => $p->nama,
                    'pekerjaan' => $p->pekerjaan,
                    'profil' => $p->profil,
                    'foto_url' => $p->foto_url,
                ];
            })->toArray(),
        ];

        return Inertia::render('webinar/checkout', [
            'webinar' => $webinarData
        ]);
    }
}
