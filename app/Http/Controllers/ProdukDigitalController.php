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

        return Inertia::render('produk-digital/index', [
            'produkList' => $produkList,
            'oldFiles' => $oldFiles,
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
            'bisa_affiliate'    => $validated['bisa_affiliate'] ?? false,
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

        // Handle file upload
        if ($request->hasFile('file')) {
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

        return Inertia::render('produk-digital/Show', [
            'produk' => $this->formatProdukDetail($produk),
            'oldFiles' => $oldFiles,
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
            'bisa_affiliate'    => $validated['bisa_affiliate'] !== null ? $validated['bisa_affiliate'] : $produk->bisa_affiliate,
            
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
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($produk->file_path) {
                Storage::disk('public')->delete($produk->file_path);
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
            'file_url'           => $p->file_url,
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

        return Inertia::render('produk-digital/public', [
            'produk' => [
                'id' => $produkDigital->id,
                'nama' => $produkDigital->nama,
                'deskripsi' => $produkDigital->deskripsi,
                'kategori' => $produkDigital->kategori,
                'harga' => $produkDigital->harga ?? 0,
                'harga_coret' => $produkDigital->harga_coret,
                'cover_url' => $produkDigital->cover_url,
                'file_url' => $produkDigital->file_url,
                'redirect_url' => $produkDigital->redirect_url,
                'tipe_pembayaran' => $produkDigital->tipe_pembayaran,
                'sumber_file' => $produkDigital->sumber_file,
                'waktu_mulai_jual' => $produkDigital->waktu_mulai_jual 
                    ? Carbon::parse($produkDigital->waktu_mulai_jual)->format('d M Y H:i')
                    : null,
                'tanggal_kadaluarsa' => $produkDigital->tanggal_kadaluarsa
                    ? Carbon::parse($produkDigital->tanggal_kadaluarsa)->format('d M Y')
                    : null,
            ],
        ]);
    }
}