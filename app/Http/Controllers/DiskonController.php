<?php

namespace App\Http\Controllers;

use App\Models\Diskon;
use App\Models\Event;
use App\Models\Webinar;
use App\Models\Bootcamp;
use App\Models\Ebook;
use App\Models\Produkdigital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DiskonController extends Controller
{
    // ─────────────────────────────────────
    // INDEX
    // ─────────────────────────────────────
    public function index(): Response
    {
        $diskons = Diskon::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'nama' => $d->nama,
                'kode_kupon' => $d->kode_kupon,
                'tipe_diskon' => $d->tipe_diskon,
                'besaran' => $d->besaran,
                'status' => $d->status,
                'is_aktif' => $d->isAktif(),
                'untuk_produk' => $d->untuk_produk,
                'jumlah_dipakai' => $d->jumlah_dipakai,
                'batas_pemakaian' => $d->batas_pemakaian,
                'tanggal_kadaluarsa' => $d->tanggal_kadaluarsa?->format('d M Y H:i'),
                'created_at' => $d->created_at->format('d M Y'),
            ]);

        // Get all products for selection
        $produk = $this->getAllProduk();

        return Inertia::render('diskon-kupon/index', [
            'diskons' => $diskons,
            'produk' => $produk,
        ]);
    }

    // ─────────────────────────────────────
    // STORE
    // ─────────────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'untuk_produk' => 'required|in:semua,pilih',
            'produk_ids' => 'nullable|array',
            'produk_ids.*' => 'string',
            'tipe_diskon' => 'required|in:persentase,nominal',
            'besaran' => 'required|numeric|min:0',
            'minimum_pembelian' => 'nullable|numeric|min:0',
            'tipe_kupon' => 'required|in:berulang,sekali',
            'untuk_pelanggan' => 'required|in:semua,pilih',
            'kode_kupon' => 'required|string|max:50|unique:diskons,kode_kupon',
            'batas_pemakaian' => 'nullable|integer|min:1',
            'waktu_mulai' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after:waktu_mulai',
        ]);

        $diskon = Diskon::create([
            'user_id' => Auth::id(),
            ...$validated,
            'produk_ids' => $validated['untuk_produk'] === 'pilih' ? ($validated['produk_ids'] ?? []) : null,
            'status' => 'aktif',
        ]);

        return redirect()->route('diskon-kupon.index')
            ->with('success', 'Diskon berhasil dibuat');
    }

    // ─────────────────────────────────────
    // SHOW
    // ─────────────────────────────────────
    public function show(Diskon $diskon): Response
    {
        // Authorization check
        if ($diskon->user_id !== Auth::id()) {
            abort(403);
        }

        // Get selected products details if any
        $produkTerpilih = [];
        if ($diskon->untuk_produk === 'pilih' && $diskon->produk_ids) {
            $produkTerpilih = $this->getProdukDetails($diskon->produk_ids);
        }

        return Inertia::render('diskon-kupon/show', [
            'diskon' => [
                'id' => $diskon->id,
                'nama' => $diskon->nama,
                'kode_kupon' => $diskon->kode_kupon,
                'untuk_produk' => $diskon->untuk_produk,
                'produk_ids' => $diskon->produk_ids ?? [],
                'produk_terpilih' => $produkTerpilih,
                'tipe_diskon' => $diskon->tipe_diskon,
                'besaran' => $diskon->besaran,
                'minimum_pembelian' => $diskon->minimum_pembelian,
                'tipe_kupon' => $diskon->tipe_kupon,
                'untuk_pelanggan' => $diskon->untuk_pelanggan,
                'batas_pemakaian' => $diskon->batas_pemakaian,
                'waktu_mulai' => $diskon->waktu_mulai?->format('Y-m-d\TH:i'),
                'tanggal_kadaluarsa' => $diskon->tanggal_kadaluarsa?->format('Y-m-d\TH:i'),
                'status' => $diskon->status,
                'jumlah_dipakai' => $diskon->jumlah_dipakai,
                'is_aktif' => $diskon->isAktif(),
                'created_at' => $diskon->created_at->format('d M Y'),
            ],
            'produk' => $this->getAllProduk(),
        ]);
    }

    // ─────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────
    public function update(Request $request, Diskon $diskon)
    {
        if ($diskon->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'untuk_produk' => 'required|in:semua,pilih',
            'produk_ids' => 'nullable|array',
            'produk_ids.*' => 'string',
            'tipe_diskon' => 'required|in:persentase,nominal',
            'besaran' => 'required|numeric|min:0',
            'minimum_pembelian' => 'nullable|numeric|min:0',
            'tipe_kupon' => 'required|in:berulang,sekali',
            'untuk_pelanggan' => 'required|in:semua,pilih',
            'kode_kupon' => 'required|string|max:50|unique:diskons,kode_kupon,' . $diskon->id,
            'batas_pemakaian' => 'nullable|integer|min:1',
            'waktu_mulai' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after:waktu_mulai',
            'status' => 'required|in:aktif,nonaktif',
        ]);

        $diskon->update([
            ...$validated,
            'produk_ids' => $validated['untuk_produk'] === 'pilih' ? ($validated['produk_ids'] ?? []) : null,
        ]);

        return back()->with('success', 'Diskon berhasil diperbarui');
    }

    // ─────────────────────────────────────
    // DESTROY
    // ─────────────────────────────────────
    public function destroy(Diskon $diskon)
    {
        if ($diskon->user_id !== Auth::id()) {
            abort(403);
        }

        $diskon->delete();

        return redirect()->route('diskon-kupon.index')
            ->with('success', 'Diskon berhasil dihapus');
    }

    // ─────────────────────────────────────
    // TOGGLE STATUS
    // ─────────────────────────────────────
    public function toggleStatus(Request $request, Diskon $diskon)
    {
        if ($diskon->user_id !== Auth::id()) {
            abort(403);
        }

        $newStatus = $diskon->status === 'aktif' ? 'nonaktif' : 'aktif';
        $diskon->update(['status' => $newStatus]);

        return back()->with('success', 'Status diskon diperbarui');
    }

    // ─────────────────────────────────────
    // HELPER: Get all products
    // ─────────────────────────────────────
    private function getAllProduk(): array
    {
        $userId = Auth::id();
        $produk = [];

        // Events
        $events = Event::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($e) => [
                'id' => 'event:' . $e->id,
                'nama' => $e->nama,
                'tipe' => 'Event',
                'harga' => 0, // Events might have tickets with different prices
            ]);
        $produk = array_merge($produk, $events->toArray());

        // Webinars
        $webinars = Webinar::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($w) => [
                'id' => 'webinar:' . $w->id,
                'nama' => $w->nama,
                'tipe' => 'Webinar',
                'harga' => $w->harga ?? 0,
            ]);
        $produk = array_merge($produk, $webinars->toArray());

        // Bootcamps
        $bootcamps = Bootcamp::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($b) => [
                'id' => 'bootcamp:' . $b->id,
                'nama' => $b->nama,
                'tipe' => 'Bootcamp',
                'harga' => $b->harga ?? 0,
            ]);
        $produk = array_merge($produk, $bootcamps->toArray());

        // Ebooks
        $ebooks = Ebook::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($e) => [
                'id' => 'ebook:' . $e->id,
                'nama' => $e->nama,
                'tipe' => 'Ebook',
                'harga' => $e->harga ?? 0,
            ]);
        $produk = array_merge($produk, $ebooks->toArray());

        // Produk Digital
        $produkDigital = Produkdigital::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($p) => [
                'id' => 'produk-digital:' . $p->id,
                'nama' => $p->nama,
                'tipe' => 'Produk Digital',
                'harga' => $p->harga ?? 0,
            ]);
        $produk = array_merge($produk, $produkDigital->toArray());

        return $produk;
    }

    // ─────────────────────────────────────
    // HELPER: Get product details by IDs
    // ─────────────────────────────────────
    private function getProdukDetails(array $ids): array
    {
        $result = [];

        foreach ($ids as $id) {
            $parts = explode(':', $id);
            if (count($parts) !== 2) continue;

            [$type, $realId] = $parts;

            $model = match($type) {
                'event' => Event::find($realId),
                'webinar' => Webinar::find($realId),
                'bootcamp' => Bootcamp::find($realId),
                'ebook' => Ebook::find($realId),
                'produk-digital' => Produkdigital::find($realId),
                default => null,
            };

            if ($model) {
                $result[] = [
                    'id' => $id,
                    'nama' => $model->nama,
                    'tipe' => ucfirst(str_replace('-', ' ', $type)),
                ];
            }
        }

        return $result;
    }
}
