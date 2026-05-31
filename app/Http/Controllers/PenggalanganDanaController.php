<?php

namespace App\Http\Controllers;

use App\Models\PenggalanganDana;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PenggalanganDanaController extends Controller
{
    /**
     * Display a listing of penggalangan dana.
     */
    public function index(): Response
    {
        $userId = Auth::id();

        $produk = PenggalanganDana::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get([
                'id',
                'tipe',
                'nama',
                'status',
                'tanggal_mulai_jual',
                'tanggal_tutup',
                'pembeli',
                'terkumpul',
                'harga',
                'cover',
                'created_at',
            ]);

        return Inertia::render('penggalangan-dana/index', [
            'produk' => $produk,
        ]);
    }

    /**
     * Show the form for creating a new penggalangan dana.
     */
    public function create(): Response
    {
        return Inertia::render('penggalangan-dana/index');
    }

    /**
     * Store a newly created penggalangan dana.
     */
    public function store(Request $request)
    {
        $tipe = $request->get('tipe', 'donasi');

        // Base validation untuk semua tipe
        $baseRules = [
            'tipe'              => 'required|in:donasi,qurban,wakaf',
            'nama'              => 'required|string|max:255',
            'deskripsi'         => 'nullable|string',
            'redirect_url'      => 'nullable|url|max:255',
            'catatan'           => 'nullable|string',
            'affiliate_enabled' => 'nullable|boolean',
            'cover'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'tanggal_mulai_jual' => 'nullable|date',
            'tanggal_tutup'     => 'nullable|date|after_or_equal:tanggal_mulai_jual',
        ];

        // Validation rules per tipe
        $rules = match ($tipe) {
            'donasi' => array_merge($baseRules, [
                'kategori'           => 'required|string|max:255',
                'tujuan'             => 'nullable|string',
                'penerima_manfaat'   => 'nullable|string',
                'harga'              => 'required|integer|min:1',
                'minimal_donasi'     => 'nullable|integer|min:0',
                'rincian_penggunaan' => 'nullable|string',
                'tampilkan_target'   => 'nullable|boolean',
                'tampilkan_pencairan' => 'nullable|boolean',
            ]),
            'qurban' => array_merge($baseRules, [
                'jenis_hewan'       => 'required|string|max:255',
                'harga'             => 'required|integer|min:1',
                'harga_coret'  => 'nullable|integer|min:0|gte:harga',
                'stok'              => 'nullable|integer|min:1',
            ]),
            'wakaf' => array_merge($baseRules, [
                'tujuan'            => 'nullable|string',
                'penerima_manfaat'  => 'nullable|string',
                'harga'             => 'required|integer|min:1',
                'rincian_penggunaan' => 'nullable|string',
                'tampilkan_target'  => 'nullable|boolean',
            ]),
            default => $baseRules,
        };

        $validated = $request->validate($rules);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('penggalangan-dana/covers', 'public');
        }

        $data = [
            'user_id'           => Auth::id(),
            'tipe'              => $validated['tipe'],
            'nama'              => $validated['nama'],
            'deskripsi'         => $validated['deskripsi'] ?? null,
            'redirect_url'      => $validated['redirect_url'] ?? null,
            'catatan'           => $validated['catatan'] ?? null,
            'affiliate_enabled' => $request->boolean('affiliate_enabled'),
            'tanggal_mulai_jual' => $validated['tanggal_mulai_jual'] ?? null,
            'tanggal_tutup'     => $validated['tanggal_tutup'] ?? null,
            'cover'             => $coverPath,
            'status'            => 'unpublished',
        ];

        // Tipe-specific fields
        if ($tipe === 'donasi') {
            $data['kategori'] = $validated['kategori'];
            $data['tujuan'] = $validated['tujuan'] ?? null;
            $data['penerima_manfaat'] = $validated['penerima_manfaat'] ?? null;
            $data['harga'] = $validated['harga'];
            $data['minimal_donasi'] = $validated['minimal_donasi'] ?? null;
            $data['rincian_penggunaan'] = $validated['rincian_penggunaan'] ?? null;
            $data['tampilkan_target'] = $request->boolean('tampilkan_target', true);
            $data['tampilkan_pencairan'] = $request->boolean('tampilkan_pencairan', false);
        } elseif ($tipe === 'qurban') {
            $data['jenis_hewan'] = $validated['jenis_hewan'];
            $data['harga'] = $validated['harga'];
            $data['harga_coret'] = $validated['harga_coret'] ?? null;
            $data['stok'] = $validated['stok'] ?? null;
        } elseif ($tipe === 'wakaf') {
            $data['tujuan'] = $validated['tujuan'] ?? null;
            $data['penerima_manfaat'] = $validated['penerima_manfaat'] ?? null;
            $data['harga'] = $validated['harga'];
            $data['rincian_penggunaan'] = $validated['rincian_penggunaan'] ?? null;
            $data['tampilkan_target'] = $request->boolean('tampilkan_target', true);
        }

        PenggalanganDana::create($data);

        return redirect()->route('penggalangan-dana.index');
    }

    /**
     * Display the specified penggalangan dana.
     */
    public function show(PenggalanganDana $penggalanganDana): Response
    {
        if ($penggalanganDana->user_id !== Auth::id()) {
            abort(403);
        }

        $prefix = 'GD-' . $penggalanganDana->id . '-';
        $allPayments = \App\Models\Pembayaran::where('order_id', 'LIKE', $prefix . '%')->get();

        $totalTransaksi   = $allPayments->count();
        $transaksiSukses  = $allPayments->where('status', 'confirmed')->count();
        $transaksiPending = $allPayments->where('status', 'pending')->count();
        $transaksiGagal   = $allPayments->where('status', 'rejected')->count();
        $nominalTransaksi = $allPayments->where('status', 'confirmed')->sum('jumlah');

        $checkoutCount = \App\Models\Pendaftaran::where('registrable_type', 'App\\Models\\PenggalanganDana')
            ->where('registrable_id', $penggalanganDana->id)
            ->count();

        $chartData = [];
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::now()->subDays($i);
            $dayLabel = $dayNames[$date->dayOfWeek];
            $dateStr = $date->toDateString();

            $dayPayments = $allPayments->filter(function ($p) use ($dateStr) {
                return $p->created_at->toDateString() === $dateStr;
            });

            $chartData[] = [
                'day'        => $dayLabel,
                'date'       => $date->format('d M'),
                'Pendapatan' => (float) $dayPayments->where('status', 'confirmed')->sum('jumlah'),
                'Transaksi'  => $dayPayments->count(),
            ];
        }

        $thisWeekRevenue = $allPayments->where('status', 'confirmed')
            ->filter(fn($p) => $p->created_at->gte(\Carbon\Carbon::now()->subDays(7)))
            ->sum('jumlah');
        $lastWeekRevenue = $allPayments->where('status', 'confirmed')
            ->filter(fn($p) => $p->created_at->gte(\Carbon\Carbon::now()->subDays(14)) && $p->created_at->lt(\Carbon\Carbon::now()->subDays(7)))
            ->sum('jumlah');
        $growthPercent = $lastWeekRevenue > 0
            ? round((($thisWeekRevenue - $lastWeekRevenue) / $lastWeekRevenue) * 100)
            : ($thisWeekRevenue > 0 ? 100 : 0);

        $busiestDay = collect($chartData)->sortByDesc('Transaksi')->first();

        $analisis = [
            'total_transaksi'    => $totalTransaksi,
            'transaksi_sukses'   => $transaksiSukses,
            'transaksi_pending'  => $transaksiPending,
            'transaksi_gagal'    => $transaksiGagal,
            'nominal_transaksi'  => (float) $nominalTransaksi,
            'checkout_count'     => $checkoutCount,
            'chart_data'         => $chartData,
            'growth_percent'     => $growthPercent,
            'busiest_day'        => $busiestDay['day'] ?? '-',
        ];

        $transaksi = $allPayments->map(fn($p) => [
            'id'                => $p->id,
            'pelanggan'         => $p->nama_pembeli,
            'email'             => $p->email_pembeli,
            'no_hp'             => $p->no_hp_pembeli,
            'status'            => $p->status === 'confirmed' ? 'Lunas' : ($p->status === 'pending' ? 'Belum Bayar' : ($p->status === 'rejected' ? 'Gagal' : 'Dibatalkan')),
            'metode_pembayaran' => $p->bukti_transfer ? 'Transfer Bank' : 'QRIS',
            'kode_kupon'        => '-',
            'tanggal'           => $p->created_at?->format('d M Y H:i'),
            'resi'              => 'Lihat',
        ]);

        // Fetch peserta yang membeli/donasi
        try {
            $pesertaList = $penggalanganDana->pendaftaran()
                ->with('peserta:id,nama,email')
                ->get()
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'nama' => $p->peserta->nama ?? 'Unknown',
                        'email' => $p->peserta->email ?? 'unknown@example.com',
                    ];
                })
                ->toArray();
        } catch (\Exception $e) {
            // Jika ada error pada relationship, kirim list kosong
            $pesertaList = [];
        }

        // Ratings - TODO: implement when Rating model is polymorphic
        $ratings = [];

        return Inertia::render('penggalangan-dana/detail', [
            'produk' => $penggalanganDana,
            'pesertaList' => $pesertaList,
            'ratings' => $ratings,
            'analisis' => $analisis,
            'transaksi' => $transaksi,
        ]);
    }

    public function publicShow(PenggalanganDana $penggalanganDana): Response
    {
        if ($penggalanganDana->status !== 'published') {
            abort(404);
        }

        $penggalanganDana->load('kabars');

        return Inertia::render('penggalangan-dana/public', [
            'penggalangan_dana' => $penggalanganDana,
        ]);
    }

    /**
     * Show the form for editing the specified penggalangan dana.
     */
    public function edit(PenggalanganDana $penggalanganDana): Response
    {
        if ($penggalanganDana->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('penggalangan-dana/index', [
            'produk' => $penggalanganDana,
            'isEdit' => true,
        ]); 
    }

    /**
     * Update the specified penggalangan dana.
     */
    public function update(Request $request, PenggalanganDana $penggalanganDana)
    {
        if ($penggalanganDana->user_id !== Auth::id()) {
            abort(403);
        }

        $tipe = $penggalanganDana->tipe;

        // Base validation untuk semua tipe
        $baseRules = [
            'nama'              => 'required|string|max:255',
            'deskripsi'         => 'nullable|string',
            'redirect_url'      => 'nullable|url|max:255',
            'catatan'           => 'nullable|string',
            'affiliate_enabled' => 'nullable|boolean',
            'cover'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'tanggal_mulai_jual' => 'nullable|date',
            'tanggal_tutup'     => 'nullable|date|after_or_equal:tanggal_mulai_jual',
        ];

        // Validation rules per tipe
        $rules = match ($tipe) {
            'donasi' => array_merge($baseRules, [
                'kategori'           => 'required|string|max:255',
                'tujuan'             => 'nullable|string',
                'penerima_manfaat'   => 'nullable|string',
                'harga'              => 'required|integer|min:1',
                'minimal_donasi'     => 'nullable|integer|min:0',
                'rincian_penggunaan' => 'nullable|string',
                'tampilkan_target'   => 'nullable|boolean',
                'tampilkan_pencairan' => 'nullable|boolean',
            ]),
            'qurban' => array_merge($baseRules, [
                'jenis_hewan'       => 'required|string|max:255',
                'harga'             => 'required|integer|min:1',
                'harga_coret'  => 'nullable|integer|min:0|gte:harga',
                'stok'              => 'nullable|integer|min:1',
            ]),
            'wakaf' => array_merge($baseRules, [
                'tujuan'            => 'nullable|string',
                'penerima_manfaat'  => 'nullable|string',
                'harga'             => 'required|integer|min:1',
                'rincian_penggunaan' => 'nullable|string',
                'tampilkan_target'  => 'nullable|boolean',
            ]),
            default => $baseRules,
        };

        $validated = $request->validate($rules);

        // Handle cover upload
        if ($request->hasFile('cover')) {
            // Delete old cover jika ada
            if ($penggalanganDana->cover) {
                Storage::disk('public')->delete($penggalanganDana->cover);
            }
            $coverPath = $request->file('cover')->store('penggalangan-dana/covers', 'public');
            $penggalanganDana->cover = $coverPath;
        }

        $penggalanganDana->update([
            'nama'              => $validated['nama'],
            'deskripsi'         => $validated['deskripsi'] ?? null,
            'redirect_url'      => $validated['redirect_url'] ?? null,
            'catatan'           => $validated['catatan'] ?? null,
            'affiliate_enabled' => $request->boolean('affiliate_enabled'),
            'tanggal_mulai_jual' => $validated['tanggal_mulai_jual'] ?? null,
            'tanggal_tutup'     => $validated['tanggal_tutup'] ?? null,
        ]);

        // Tipe-specific updates
        if ($tipe === 'donasi') {
            $penggalanganDana->update([
                'kategori'           => $validated['kategori'],
                'tujuan'             => $validated['tujuan'] ?? null,
                'penerima_manfaat'   => $validated['penerima_manfaat'] ?? null,
                'harga'              => $validated['harga'],
                'minimal_donasi'     => $validated['minimal_donasi'] ?? null,
                'rincian_penggunaan' => $validated['rincian_penggunaan'] ?? null,
                'tampilkan_target'   => $request->boolean('tampilkan_target', true),
                'tampilkan_pencairan' => $request->boolean('tampilkan_pencairan', false),
            ]);
        } elseif ($tipe === 'qurban') {
            $penggalanganDana->update([
                'jenis_hewan'  => $validated['jenis_hewan'],
                'harga'        => $validated['harga'],
                'harga_coret'  => $validated['harga_coret'] ?? null,
                'stok'         => $validated['stok'] ?? null,
            ]);
        } elseif ($tipe === 'wakaf') {
            $penggalanganDana->update([
                'tujuan'             => $validated['tujuan'] ?? null,
                'penerima_manfaat'   => $validated['penerima_manfaat'] ?? null,
                'harga'              => $validated['harga'],
                'rincian_penggunaan' => $validated['rincian_penggunaan'] ?? null,
                'tampilkan_target'   => $request->boolean('tampilkan_target', true),
            ]);
        }

        return redirect()->route('penggalangan-dana.index');
    }

    /**
     * Update status of penggalangan dana.
     */
    public function updateStatus(Request $request, PenggalanganDana $penggalanganDana)
    {
        if ($penggalanganDana->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $penggalanganDana->update(['status' => $validated['status']]);

        return redirect()->route('penggalangan-dana.show', $penggalanganDana->id);
    }

    /**
     * Duplicate penggalangan dana.
     */
    public function duplicate(PenggalanganDana $penggalanganDana)
    {
        if ($penggalanganDana->user_id !== Auth::id()) {
            abort(403);
        }

        // Create copy dengan timestamp baru
        $duplicate = $penggalanganDana->replicate();
        $duplicate->nama = $penggalanganDana->nama . ' (Copy)';
        $duplicate->status = 'unpublished';
        $duplicate->pembeli = 0;
        $duplicate->terkumpul = 0;
        $duplicate->save();

        // Copy cover file jika ada
        if ($penggalanganDana->cover) {
            $oldPath = $penggalanganDana->cover;
            $newPath = str_replace($penggalanganDana->id, $duplicate->id, $oldPath);
            Storage::disk('public')->copy($oldPath, $newPath);
            $duplicate->update(['cover' => $newPath]);
        }

        return redirect()->route('penggalangan-dana.show', $duplicate->id);
    }

    /**
     * Store kabar terbaru for penggalangan dana.
     */
    public function storeKabar(Request $request, PenggalanganDana $penggalanganDana)
    {
        if ($penggalanganDana->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'required|string',
        ]);

        $penggalanganDana->kabars()->create($validated);

        return redirect()->route('penggalangan-dana.show', $penggalanganDana->id);
    }

    /**
     * Remove the specified penggalangan dana.
     */
    public function destroy(PenggalanganDana $penggalanganDana)
    {
        if ($penggalanganDana->user_id !== Auth::id()) {
            abort(403);
        }

        // Delete cover file jika ada
        if ($penggalanganDana->cover) {
            Storage::disk('public')->delete($penggalanganDana->cover);
        }

        $penggalanganDana->delete();

        return redirect()->route('penggalangan-dana.index');
    }
    public function catalog(): Response
    {
        $produk = PenggalanganDana::where('status', 'published')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "penggalangan-dana:{$p->id}",
                'product_id' => $p->id,
                'type' => 'penggalangan-dana',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'terkumpul' => $p->terkumpul ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => $p->pembeli ?? 0,
                'kategori' => ucfirst($p->tipe),
                'progress_percent' => $p->progress_percent ?? 0,
            ]);

        return Inertia::render('penggalangan-dana/catalog', [
            'produk' => $produk,
        ]);
    }
}
