<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProdukDigitalRequest;
use App\Http\Requests\UpdateProdukDigitalRequest;
use App\Models\ProdukDigital;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ProdukDigitalController extends Controller
{
    public function index()
    {
        $produkList = ProdukDigital::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'              => $p->id,
                'nama'            => $p->nama,
                'status'          => $p->status,
                'tipe_pembayaran' => $p->tipe_pembayaran,
                'harga'           => $p->harga,
                'harga_coret'     => $p->harga_coret,
                'sumber_file'     => $p->sumber_file,
                'cover_url'       => $p->cover_url,
                'total_penjualan' => $p->total_penjualan,
                'kategori'        => $p->kategori,
                'created_at'      => $p->created_at?->format('d M Y'),
            ]);

        // Get list of previously uploaded files for file_lama option
        $oldFiles = ProdukDigital::where('user_id', Auth::id())
            ->whereNotNull('file_path')
            ->where('sumber_file', 'upload')
            ->select('id', 'file_path', 'file_url', 'nama')
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id' => $p->file_path,
                'label' => $p->nama . ' (' . basename($p->file_path) . ')',
                'file_path' => $p->file_path,
                'file_url' => $p->file_url,
            ])
            ->unique('id')
            ->values();

        $productIds = ProdukDigital::where('user_id', Auth::id())->pluck('id');
        
        $totalRevenue = (float) \App\Models\Pendaftaran::whereIn('registrable_type', ['produkdigital', \App\Models\ProdukDigital::class])
            ->whereIn('registrable_id', $productIds)
            ->whereIn('status', ['active', 'aktif'])
            ->sum('harga_bayar');

        $revenueThisMonth = (float) \App\Models\Pendaftaran::whereIn('registrable_type', ['produkdigital', \App\Models\ProdukDigital::class])
            ->whereIn('registrable_id', $productIds)
            ->whereIn('status', ['active', 'aktif'])
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('harga_bayar');

        $revenueLastMonth = (float) \App\Models\Pendaftaran::whereIn('registrable_type', ['produkdigital', \App\Models\ProdukDigital::class])
            ->whereIn('registrable_id', $productIds)
            ->whereIn('status', ['active', 'aktif'])
            ->whereBetween('created_at', [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])
            ->sum('harga_bayar');

        if ($revenueLastMonth > 0) {
            $percentageChange = (($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100;
        } else {
            $percentageChange = $revenueThisMonth > 0 ? 100.0 : 0.0;
        }

        $growthText = ($percentageChange >= 0 ? '+' : '') . number_format($percentageChange, 0) . '% Dari bulan kemarin';

        return Inertia::render('produk-digital/index', [
            'produkList' => $produkList,
            'oldFiles' => $oldFiles,
            'totalRevenue' => $totalRevenue,
            'revenueGrowthText' => $growthText,
        ]);
    }
    public function edit($id)
{
    $produkDigital = ProdukDigital::where('id', $id)
        ->where('user_id', Auth::id())
        ->firstOrFail();

    return Inertia::render('produk-digital/detail/editprodukdigitaldialog', [
        'produk' => $this->formatProdukDetail($produkDigital),
    ]);
}

    public function store(StoreProdukDigitalRequest $request)
    {
        $validated = $request->validated();

        $slug = $this->generateUniqueSlug($validated['nama']);

        $data = [
            'user_id'           => Auth::id(),
            'nama'              => $validated['nama'],
            'slug'              => $slug,
            'deskripsi'         => $validated['deskripsi'],
            'kategori'          => $validated['kategori'] ?? null,
            'tipe_pembayaran'   => $validated['tipe_pembayaran'],
            'harga'             => $validated['harga'],
            'harga_coret'       => $validated['harga_coret'] ?? null,
            'sumber_file'       => $validated['sumber_file'],
            'redirect_url'      => $validated['redirect_url'] ?? null,
            'waktu_mulai_jual'  => $validated['waktu_mulai_jual'] ?? null,
            'tanggal_kadaluarsa'=> $validated['tanggal_kadaluarsa'] ?? null,
            'catatan'           => $validated['catatan'] ?? null,
            'max_pembayaran'    => $validated['max_pembayaran'] ?? null,
            'bisa_affiliate'    => false,
            'status'            => 'unpublished',
            
            // Specific Fields
            'author'            => $validated['author'] ?? null,
            'isbn'              => $validated['isbn'] ?? null,
            'format'            => $validated['format'] ?? null,
            'bahasa'            => $validated['bahasa'] ?? null,
            'jumlah_halaman'    => $validated['jumlah_halaman'] ?? null,
            'tanggal_publish'   => $validated['tanggal_publish'] ?? null,
            'bisa_didownload'   => $validated['bisa_didownload'] ?? true,
            'tipe_tulisan'      => $validated['tipe_tulisan'] ?? null,
            'mekanisme_bayar'   => $validated['mekanisme_bayar'] ?? null,
            'genre'             => $validated['genre'] ?? null,
            'transkrip'         => $validated['transkrip'] ?? null,
            'pembicara'         => $validated['pembicara'] ?? null,
            'durasi'            => $validated['durasi'] ?? null,
            'artis'             => $validated['artis'] ?? null,
            'kategori_produk'   => $validated['kategori_produk'] ?? null,
            'tipe_pembaca'      => $validated['tipe_pembaca'] ?? null,
        ];

        // Handle file lama reference
        if ($validated['sumber_file'] === 'file_lama' && ($validated['file_lama_id'] ?? null)) {
            $data['file_lama_id'] = $validated['file_lama_id'];
        }

        // Handle page files upload (multiple images for comic)
        if ($request->hasFile('page_files')) {
            $paths = [];
            $urls = [];
            foreach ($request->file('page_files') as $file) {
                $path = $file->store('produk-digital/files', 'public');
                $paths[] = $path;
                $urls[] = Storage::url($path);
            }
            $data['file_path'] = json_encode($paths);
            $data['file_url']  = json_encode($urls);
        } elseif ($request->hasFile('file')) {
            $path = $request->file('file')->store('produk-digital/files', 'public');
            $data['file_path'] = $path;
            $data['file_url']  = Storage::url($path);
        }

        // Handle cover upload
        if ($request->hasFile('cover')) {
            $path = $request->file('cover')->store('produk-digital/covers', 'public');
            $data['cover']     = $path;
            $data['cover_url'] = Storage::url($path);
        }

        ProdukDigital::create($data);

        return redirect()->route('produk-digital.index')
            ->with('success', 'Produk digital berhasil dibuat!');
    }

    public function show($id)
    {
        $produk = ProdukDigital::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $oldFiles = ProdukDigital::where('user_id', Auth::id())
            ->whereNotNull('file_path')
            ->where('sumber_file', 'upload')
            ->select('id', 'file_path', 'file_url', 'nama')
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id' => $p->file_path,
                'label' => $p->nama . ' (' . basename($p->file_path) . ')',
                'file_path' => $p->file_path,
                'file_url' => $p->file_url,
            ])
            ->unique('id')
            ->values();

        // ── Analytics: query real data from pembayarans ──────────────
        $prefix = 'PD-' . $produk->id . '-';

        // All payments for this product (order_id starts with PD-{id}-)
        $allPayments = \App\Models\Pembayaran::where('order_id', 'LIKE', $prefix . '%')->get();

        $totalTransaksi   = $allPayments->count();
        $transaksiSukses  = $allPayments->where('status', 'confirmed')->count();
        $transaksiPending = $allPayments->where('status', 'pending')->count();
        $transaksiGagal   = $allPayments->where('status', 'rejected')->count();
        $nominalTransaksi = $allPayments->where('status', 'confirmed')->sum('jumlah');

        // Also count from Pendaftaran for checkout funnel (how many reached checkout)
        $checkoutCount = \App\Models\Pendaftaran::where('registrable_type', 'App\\Models\\ProdukDigital')
            ->where('registrable_id', $produk->id)
            ->count();

        // Weekly chart data (last 7 days)
        $chartData = [];
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
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

        // Calculate week-over-week growth
        $thisWeekRevenue = $allPayments->where('status', 'confirmed')
            ->filter(fn($p) => $p->created_at->gte(Carbon::now()->subDays(7)))
            ->sum('jumlah');
        $lastWeekRevenue = $allPayments->where('status', 'confirmed')
            ->filter(fn($p) => $p->created_at->gte(Carbon::now()->subDays(14)) && $p->created_at->lt(Carbon::now()->subDays(7)))
            ->sum('jumlah');
        $growthPercent = $lastWeekRevenue > 0
            ? round((($thisWeekRevenue - $lastWeekRevenue) / $lastWeekRevenue) * 100)
            : ($thisWeekRevenue > 0 ? 100 : 0);

        // Find busiest day of the week
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

        $ratings = $produk->ratings()->with('peserta')->latest()->get()->map(fn($r) => [
            'id'           => $r->id,
            'bintang'      => $r->bintang,
            'ulasan'       => $r->ulasan,
            'tampil_anonim'=> (bool) $r->tampil_anonim,
            'foto_url'     => $r->foto_url,
            'nama_peserta' => $r->tampil_anonim ? 'Anonim' : ($r->peserta?->nama ?? '-'),
            'created_at'   => $r->created_at->toISOString(),
        ])->values()->toArray();

        return Inertia::render('produk-digital/Show', [
            'produk'    => $this->formatProdukDetail($produk),
            'oldFiles'  => $oldFiles,
            'analisis'  => $analisis,
            'transaksi' => $transaksi,
            'ratings'   => $ratings,
        ]);
    }

    public function update(UpdateProdukDigitalRequest $request, $id)
    {
        $produk = ProdukDigital::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validated();

        $data = [
            'nama'              => $validated['nama'],
            'deskripsi'         => $validated['deskripsi'] ?? $produk->deskripsi,
            'kategori'          => $validated['kategori'] ?? $produk->kategori,
            'tipe_pembayaran'   => $validated['tipe_pembayaran'] ?? $produk->tipe_pembayaran,
            'harga'             => $validated['harga'] !== null ? $validated['harga'] : $produk->harga,
            'harga_coret'       => $validated['harga_coret'] ?? $produk->harga_coret,
            'sumber_file'       => $validated['sumber_file'] ?? $produk->sumber_file,
            'redirect_url'      => $validated['redirect_url'] ?? $produk->redirect_url,
            'waktu_mulai_jual'  => $validated['waktu_mulai_jual'] ?? $produk->waktu_mulai_jual,
            'tanggal_kadaluarsa'=> $validated['tanggal_kadaluarsa'] ?? $produk->tanggal_kadaluarsa,
            'catatan'           => $validated['catatan'] ?? $produk->catatan,
            'max_pembayaran'    => $validated['max_pembayaran'] ?? $produk->max_pembayaran,
            'bisa_affiliate'    => false,
            
            // Specific Fields
            'author'            => $validated['author'] ?? $produk->author,
            'isbn'              => $validated['isbn'] ?? $produk->isbn,
            'format'            => $validated['format'] ?? $produk->format,
            'bahasa'            => $validated['bahasa'] ?? $produk->bahasa,
            'jumlah_halaman'    => $validated['jumlah_halaman'] ?? $produk->jumlah_halaman,
            'tanggal_publish'   => $validated['tanggal_publish'] ?? $produk->tanggal_publish,
            'bisa_didownload'   => $validated['bisa_didownload'] ?? $produk->bisa_didownload,
            'tipe_tulisan'      => $validated['tipe_tulisan'] ?? $produk->tipe_tulisan,
            'mekanisme_bayar'   => $validated['mekanisme_bayar'] ?? $produk->mekanisme_bayar,
            'genre'             => $validated['genre'] ?? $produk->genre,
            'transkrip'         => $validated['transkrip'] ?? $produk->transkrip,
            'pembicara'         => $validated['pembicara'] ?? $produk->pembicara,
            'durasi'            => $validated['durasi'] ?? $produk->durasi,
            'artis'             => $validated['artis'] ?? $produk->artis,
            'kategori_produk'   => $validated['kategori_produk'] ?? $produk->kategori_produk,
            'tipe_pembaca'      => $validated['tipe_pembaca'] ?? $produk->tipe_pembaca,
        ];

        // Update slug if nama changed
        if ($validated['nama'] !== $produk->nama) {
            $data['slug'] = $this->generateUniqueSlug($validated['nama']);
        }

        // Handle sumber_file changes
        if (($validated['sumber_file'] ?? null) && $validated['sumber_file'] !== $produk->sumber_file) {
            // If changing source, clear related fields appropriately
            if ($validated['sumber_file'] === 'link') {
                $data['file_path'] = null;
                $data['file_url'] = null;
                $data['file_lama_id'] = null;
            } elseif ($validated['sumber_file'] === 'file_lama') {
                $data['file_path'] = null;
                $data['file_url'] = null;
                $data['redirect_url'] = null;
                if ($validated['file_lama_id'] ?? null) {
                    $data['file_lama_id'] = $validated['file_lama_id'];
                }
            } elseif ($validated['sumber_file'] === 'upload') {
                $data['file_lama_id'] = null;
                $data['redirect_url'] = null;
            }
        }

        // Handle file upload/replacement
        if ($request->hasFile('page_files')) {
            // Delete old files if they exist
            if ($produk->file_path) {
                $oldPaths = json_decode($produk->file_path, true);
                if (is_array($oldPaths)) {
                    foreach ($oldPaths as $oldPath) {
                        Storage::disk('public')->delete($oldPath);
                    }
                } else {
                    Storage::disk('public')->delete($produk->file_path);
                }
            }

            $paths = [];
            $urls = [];
            foreach ($request->file('page_files') as $file) {
                $path = $file->store('produk-digital/files', 'public');
                $paths[] = $path;
                $urls[] = Storage::url($path);
            }
            $data['file_path'] = json_encode($paths);
            $data['file_url']  = json_encode($urls);
        } elseif ($request->hasFile('file')) {
            // Delete old file if exists
            if ($produk->file_path) {
                $oldPaths = json_decode($produk->file_path, true);
                if (is_array($oldPaths)) {
                    foreach ($oldPaths as $oldPath) {
                        Storage::disk('public')->delete($oldPath);
                    }
                } else {
                    Storage::disk('public')->delete($produk->file_path);
                }
            }

            $path = $request->file('file')->store('produk-digital/files', 'public');
            $data['file_path'] = $path;
            $data['file_url']  = Storage::url($path);
        }

        // Handle cover upload/replacement
        if ($request->hasFile('cover')) {
            // Delete old cover if exists
            if ($produk->cover) {
                Storage::disk('public')->delete($produk->cover);
            }

            $path = $request->file('cover')->store('produk-digital/covers', 'public');
            $data['cover']     = $path;
            $data['cover_url'] = Storage::url($path);
        }

        $produk->update($data);

        return back()->with('success', 'Produk berhasil diupdate!');
    }

    public function updateStatus(Request $request, $id)
    {
        $produk = ProdukDigital::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $produk->update(['status' => $request->status]);

        return back()->with('success', 'Status berhasil diubah!');
    }

    public function duplicate($id)
    {
        $produk = ProdukDigital::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $new = $produk->replicate();

        $new->nama = $produk->nama . ' (Duplikat)';
        $new->slug = $this->generateUniqueSlug($new->nama);
        $new->status = 'unpublished';
        $new->total_penjualan = 0;

        $new->save();

        return redirect()->route('produk-digital.show', $new->id);
    }

    public function destroy($id)
    {
        $produk = ProdukDigital::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($produk->file_path) {
            Storage::disk('public')->delete($produk->file_path);
        }

        if ($produk->cover) {
            Storage::disk('public')->delete($produk->cover);
        }

        $produk->delete();

        return redirect()->route('produk-digital.index');
    }

    // 🔥 helper slug unik
    private function generateUniqueSlug($nama)
    {
        $slug = Str::slug($nama);
        $original = $slug;
        $i = 1;

        while (ProdukDigital::where('slug', $slug)->exists()) {
            $slug = $original . '-' . $i++;
        }

        return $slug;
    }

    private function formatProdukDetail(ProdukDigital $p): array
    {
        return [
            'id'                 => $p->id,
            'nama'               => $p->nama,
            'slug'               => $p->slug,
            'status'             => $p->status,
            'tipe_pembayaran'    => $p->tipe_pembayaran,
            'harga'              => $p->harga,
            'harga_coret'        => $p->harga_coret,
            'deskripsi'          => $p->deskripsi,
            'kategori'           => $p->kategori,
            'sumber_file'        => $p->sumber_file,
            'file_url'           => $p->sumber_file === 'file_lama' && $p->file_lama_id ? Storage::url($p->file_lama_id) : $p->file_url,
            'file_lama_id'       => $p->file_lama_id,
            'redirect_url'       => $p->redirect_url,
            'cover_url'          => $p->cover_url,
            'waktu_mulai_jual'   => $p->waktu_mulai_jual
                ? Carbon::parse($p->waktu_mulai_jual)->format('d M Y H:i')
                : null,
            'waktu_mulai_jual_raw' => $p->waktu_mulai_jual
                ? Carbon::parse($p->waktu_mulai_jual)->toIso8601String()
                : null,
            'tanggal_kadaluarsa' => $p->tanggal_kadaluarsa
                ? Carbon::parse($p->tanggal_kadaluarsa)->format('d M Y')
                : null,
            'tanggal_kadaluarsa_raw' => $p->tanggal_kadaluarsa
                ? Carbon::parse($p->tanggal_kadaluarsa)->toDateString()
                : null,
            'catatan'            => $p->catatan,
            'max_pembayaran'     => $p->max_pembayaran,
            'bisa_affiliate'     => (bool) $p->bisa_affiliate,
            'total_penjualan'    => $p->total_penjualan,
            'created_at'         => $p->created_at?->format('d M Y'),
            
            // Specific Fields
            'author'             => $p->author,
            'isbn'               => $p->isbn,
            'format'             => $p->format,
            'bahasa'             => $p->bahasa,
            'jumlah_halaman'     => $p->jumlah_halaman,
            'tanggal_publish'    => $p->tanggal_publish ? Carbon::parse($p->tanggal_publish)->format('d M Y') : null,
            'tanggal_publish_raw' => $p->tanggal_publish ? Carbon::parse($p->tanggal_publish)->toDateString() : null,
            'bisa_didownload'    => (bool) $p->bisa_didownload,
            'tipe_tulisan'       => $p->tipe_tulisan,
            'mekanisme_bayar'    => $p->mekanisme_bayar,
            'genre'              => $p->genre,
            'transkrip'          => $p->transkrip,
            'pembicara'          => $p->pembicara,
            'durasi'             => $p->durasi,
            'artis'              => $p->artis,
            'kategori_produk'    => $p->kategori_produk,
            'tipe_pembaca'       => $p->tipe_pembaca,
        ];
    }

    private function getKategoriLabel(?string $kategori): string
    {
        $labels = [
            'e-book' => 'E-Book',
            'novel' => 'Novel',
            'komik' => 'Komik',
            'template' => 'Template',
            'tulisan' => 'Tulisan / Artikel',
            'video' => 'Video',
        ];

        return $labels[$kategori] ?? 'Produk Digital';
    }

    public function catalog()
    {
        $userId = Auth::id();
        $produk = ProdukDigital::where('user_id', $userId)
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "produk-digital:{$p->id}",
                'product_id' => $p->id,
                'type' => 'produk-digital',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => $p->total_penjualan ?? 0,
                'kategori' => $p->kategori ?? 'Produk Digital',
                'kategori_display' => $this->getKategoriLabel($p->kategori),
                'cover_url' => $p->cover_url,
            ]);

        return Inertia::render('produk-digital/catalog', [
            'produk' => $produk,
            'categories' => [
                'e-book' => 'E-Book',
                'novel' => 'Novel',
                'komik' => 'Komik',
                'template' => 'Template',
                'tulisan' => 'Tulisan / Artikel',
                'video' => 'Video',
            ],
        ]);
    }

    public function publicShow(ProdukDigital $produkDigital)
    {
        // Only show published products
        if ($produkDigital->status !== 'published') {
            abort(404);
        }

        $hasAccess = false;
        $peserta = Auth::guard('peserta')->user();
        if ($peserta) {
            $hasAccess = \App\Models\Pendaftaran::where('peserta_id', $peserta->id)
                ->where('registrable_id', $produkDigital->id)
                ->where(function($q) {
                    $q->where('registrable_type', 'produkdigital')
                      ->orWhere('registrable_type', ProdukDigital::class);
                })
                ->whereIn('status', ['active', 'aktif', 'completed', 'selesai'])
                ->exists();
        }

        $isCreator = auth()->check() && $produkDigital->user_id === auth()->id();
        $isFree = $produkDigital->tipe_pembayaran === 'gratis';
        $allowFile = $hasAccess || $isCreator || $isFree;

        return Inertia::render('produk-digital/public', [
            'produk' => [
                'id' => $produkDigital->id,
                'nama' => $produkDigital->nama,
                'deskripsi' => $produkDigital->deskripsi,
                'kategori' => $produkDigital->kategori,
                'harga' => $produkDigital->harga ?? 0,
                'harga_coret' => $produkDigital->harga_coret,
                'cover_url' => $produkDigital->cover_url,
                'file_url' => $allowFile ? $produkDigital->file_url : null,
                'redirect_url' => $produkDigital->redirect_url,
                'tipe_pembayaran' => $produkDigital->tipe_pembayaran,
                'sumber_file' => $produkDigital->sumber_file,
                'waktu_mulai_jual' => $produkDigital->waktu_mulai_jual 
                    ? Carbon::parse($produkDigital->waktu_mulai_jual)->format('d M Y H:i')
                    : null,
                'tanggal_kadaluarsa' => $produkDigital->tanggal_kadaluarsa
                    ? Carbon::parse($produkDigital->tanggal_kadaluarsa)->format('d M Y')
                    : null,
                'user_id' => $produkDigital->user_id,
            ],
            'hasAccess' => $hasAccess,
        ]);
    }

    public function uploadEditorImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // max 10MB
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produk-digital/editor-images', 'public');
            return response()->json([
                'url' => Storage::url($path),
            ]);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
    }
}