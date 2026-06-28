<?php

namespace App\Http\Controllers;

use App\Models\Diskon;
use App\Models\Event;
use App\Models\Webinar;
use App\Models\Bootcamp;
use App\Models\Ebook;
use App\Models\Produkdigital;
use App\Models\CoachingMentoring;
use App\Models\Tulisan;
use App\Models\KelasOnline;
use App\Models\PaymentLink;
use App\Models\Bundling;
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
            ->with('user')
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
                'penjual' => $d->user?->name ?? 'Admin',
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
            'batas_per_orang' => 'nullable|integer|min:1',
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

        // Get usage statistics
        $usage = [];

        // Query Pendaftaran using this coupon
        $pendaftarans = \App\Models\Pendaftaran::whereRaw('UPPER(coupon_code) = ?', [strtoupper($diskon->kode_kupon)])
            ->whereIn('status', ['active', 'aktif', 'completed'])
            ->get();

        foreach ($pendaftarans as $p) {
            $product = $p->registrable;
            if ($product) {
                $name = $product->nama ?? $product->name ?? $product->title ?? 'Produk';
                $type = class_basename($p->registrable_type);
                $typeMap = [
                    'Produkdigital' => 'Produk Digital',
                    'CoachingMentoring' => 'Coaching / Mentoring',
                    'KelasOnline' => 'Kelas Online',
                    'PaymentLink' => 'Link Pembayaran',
                    'Ebook' => 'Ebook',
                    'Bundling' => 'Bundling',
                    'Event' => 'Event',
                    'Webinar' => 'Webinar',
                    'Bootcamp' => 'Bootcamp',
                    'Tulisan' => 'Tulisan'
                ];
                if (isset($typeMap[$type])) {
                    $type = $typeMap[$type];
                }
                
                $key = $type . ':' . $product->id;
                if (!isset($usage[$key])) {
                    $usage[$key] = [
                        'nama' => $name,
                        'tipe' => $type,
                        'kali_dipakai' => 0,
                    ];
                }
                $usage[$key]['kali_dipakai']++;
            }
        }

        // Query KelasOnlinePeserta using this coupon
        $kelasEnrolls = \App\Models\KelasOnlinePeserta::whereRaw('UPPER(coupon_code) = ?', [strtoupper($diskon->kode_kupon)])
            ->where('status', 'aktif')
            ->get();

        foreach ($kelasEnrolls as $k) {
            $product = $k->kelasOnline;
            if ($product) {
                $name = $product->nama ?? 'Kelas Online';
                $type = 'Kelas Online';
                
                $key = $type . ':' . $product->id;
                if (!isset($usage[$key])) {
                    $usage[$key] = [
                        'nama' => $name,
                        'tipe' => $type,
                        'kali_dipakai' => 0,
                    ];
                }
                $usage[$key]['kali_dipakai']++;
            }
        }

        $riwayatPenggunaan = array_values($usage);

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
                'riwayat_penggunaan' => $riwayatPenggunaan,
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
            'batas_per_orang' => 'nullable|integer|min:1',
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
                'harga' => 0,
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
                'nama' => $b->nama ?? $b->name,
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

        // Coaching Mentoring
        $coachings = CoachingMentoring::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($c) => [
                'id' => 'coaching-mentoring:' . $c->id,
                'nama' => $c->nama,
                'tipe' => 'Coaching / Mentoring',
                'harga' => $c->harga ?? 0,
            ]);
        $produk = array_merge($produk, $coachings->toArray());

        // Tulisan
        $tulisans = Tulisan::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($t) => [
                'id' => 'tulisan:' . $t->id,
                'nama' => $t->nama,
                'tipe' => 'Tulisan',
                'harga' => $t->harga ?? 0,
            ]);
        $produk = array_merge($produk, $tulisans->toArray());

        // Kelas Online
        $kelasOnlines = KelasOnline::where('user_id', $userId)
            ->whereIn('status', ['published', 'aktif'])
            ->get()
            ->map(fn($k) => [
                'id' => 'kelas-online:' . $k->id,
                'nama' => $k->nama,
                'tipe' => 'Kelas Online',
                'harga' => $k->harga ?? 0,
            ]);
        $produk = array_merge($produk, $kelasOnlines->toArray());

        // Payment Link
        $paymentLinks = PaymentLink::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($l) => [
                'id' => 'payment-link:' . $l->id,
                'nama' => $l->nama,
                'tipe' => 'Link Pembayaran',
                'harga' => $l->harga ?? 0,
            ]);
        $produk = array_merge($produk, $paymentLinks->toArray());

        // Bundlings
        $bundlings = Bundling::where('user_id', $userId)
            ->where('status', 'published')
            ->get()
            ->map(fn($b) => [
                'id' => 'bundling:' . $b->id,
                'nama' => $b->nama,
                'tipe' => 'Bundling',
                'harga' => $b->harga ?? 0,
            ]);
        $produk = array_merge($produk, $bundlings->toArray());

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
                'coaching-mentoring' => CoachingMentoring::find($realId),
                'tulisan' => Tulisan::find($realId),
                'kelas-online' => KelasOnline::find($realId),
                'payment-link' => PaymentLink::find($realId),
                'bundling' => Bundling::find($realId),
                default => null,
            };

            if ($model) {
                $result[] = [
                    'id' => $id,
                    'nama' => $model->nama ?? $model->name,
                    'tipe' => ucfirst(str_replace('-', ' ', $type)),
                ];
            }
        }

        return $result;
    }

    public function validateCoupon(Request $request)
    {
        $request->validate([
            'kode_kupon' => 'required|string',
            'product_id' => 'required|string', // format: "type:id" e.g. "ebook:1"
            'harga' => 'required|numeric',
        ]);

        $kode = strtoupper($request->kode_kupon);
        $productId = $request->product_id;
        $harga = floatval($request->harga);

        // Find diskon
        $diskon = Diskon::whereRaw('UPPER(kode_kupon) = ?', [$kode])->first();

        if (!$diskon) {
            return response()->json([
                'success' => false,
                'message' => 'Kode kupon tidak valid atau tidak ditemukan.',
            ], 422);
        }

        // Check status
        $isAktif = ($diskon->status === 'aktif' || $diskon->is_aktif);
        if (!$isAktif) {
            return response()->json([
                'success' => false,
                'message' => 'Kupon ini sudah tidak aktif.',
            ], 422);
        }

        // Check tanggal mulai
        if ($diskon->waktu_mulai && now() < \Carbon\Carbon::parse($diskon->waktu_mulai)) {
            return response()->json([
                'success' => false,
                'message' => 'Kupon ini belum bisa digunakan.',
            ], 422);
        }

        // Check tanggal kadaluarsa
        if ($diskon->tanggal_kadaluarsa && now() > \Carbon\Carbon::parse($diskon->tanggal_kadaluarsa)) {
            return response()->json([
                'success' => false,
                'message' => 'Kupon ini sudah kedaluwarsa.',
            ], 422);
        }

        // Check limit pemakaian
        if ($diskon->batas_pemakaian !== null && $diskon->jumlah_dipakai >= $diskon->batas_pemakaian) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota penggunaan kupon ini sudah habis.',
            ], 422);
        }

        // Check minimum pembelian
        if ($diskon->minimum_pembelian !== null && $harga < $diskon->minimum_pembelian) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum pembelian untuk menggunakan kupon ini adalah Rp ' . number_format($diskon->minimum_pembelian, 0, ',', '.'),
            ], 422);
        }

        // Check target produk
        if ($diskon->untuk_produk === 'pilih') {
            $productIds = $diskon->produk_ids ?? [];
            if (!is_array($productIds)) {
                $productIds = json_decode($productIds, true) ?? [];
            }
            // Normalize product ID comparison. In DB, it might be stored as e.g. "ebook:1", or type name might have underscores, etc.
            // Let's normalize it to lowercase
            $normalizedProductId = strtolower($productId);
            $normalizedProductIds = array_map('strtolower', $productIds);

            if (!in_array($normalizedProductId, $normalizedProductIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kupon ini tidak dapat digunakan untuk produk ini.',
                ], 422);
            }
        }

        // Calculate discount
        $besaran = floatval($diskon->besaran);
        $discountAmount = 0;
        if ($diskon->tipe_diskon === 'persentase') {
            $discountAmount = ($besaran / 100) * $harga;
        } else {
            $discountAmount = $besaran;
        }

        // Discount cannot exceed original price
        if ($discountAmount > $harga) {
            $discountAmount = $harga;
        }

        $finalPrice = $harga - $discountAmount;

        return response()->json([
            'success' => true,
            'message' => 'Kupon berhasil diterapkan!',
            'diskon_id' => $diskon->id,
            'tipe_diskon' => $diskon->tipe_diskon,
            'besaran' => $besaran,
            'discount_amount' => $discountAmount,
            'final_price' => $finalPrice,
        ]);
    }
}
