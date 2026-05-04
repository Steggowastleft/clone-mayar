<?php

namespace App\Http\Controllers;

use App\Models\ProdukDigital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;

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

        return Inertia::render('produk-digital/index', [
            'produkList' => $produkList,
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

    public function store(Request $request)
    {
        $request->validate([
            'nama'              => 'required|string|max:200',
            'deskripsi'         => 'required|string',
            'kategori'          => 'nullable|in:e-book,novel,komik,template,tulisan,video',
            'tipe_pembayaran'   => 'required|in:berbayar,gratis',
            'harga'             => 'required_if:tipe_pembayaran,berbayar|numeric|min:0',
            'harga_coret'       => 'nullable|numeric|gt:harga',
            'sumber_file'       => 'required|in:upload,file_lama,link',
            'file'              => 'nullable|file|max:1048576',
            'redirect_url'      => 'nullable|url',
            'cover'             => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4|max:10240',
            'waktu_mulai_jual'  => 'nullable|date',
            'tanggal_kadaluarsa'=> 'nullable|date',
            'catatan'           => 'nullable|string|max:1000',
            'max_pembayaran'    => 'nullable|integer|min:1',
            'bisa_affiliate'    => 'nullable|boolean',
        ]);

        $slug = $this->generateUniqueSlug($request->nama);

        $data = [
            'user_id'           => Auth::id(),
            'nama'              => $request->nama,
            'slug'              => $slug,
            'deskripsi'         => $request->deskripsi,
            'kategori'          => $request->kategori,
            'tipe_pembayaran'   => $request->tipe_pembayaran,
            'harga'             => $request->tipe_pembayaran === 'gratis' ? 0 : (int) $request->harga,
            'harga_coret'       => $request->harga_coret ? (int) $request->harga_coret : null,
            'sumber_file'       => $request->sumber_file,
            'redirect_url'      => $request->redirect_url,
            'waktu_mulai_jual'  => $request->waktu_mulai_jual,
            'tanggal_kadaluarsa'=> $request->tanggal_kadaluarsa,
            'catatan'           => $request->catatan,
            'max_pembayaran'    => $request->max_pembayaran,
            'bisa_affiliate'    => (bool) $request->bisa_affiliate,
            'status'            => 'unpublished',
        ];

        // file
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('produk-digital/files', 'public');
            $data['file_path'] = $path;
            $data['file_url']  = Storage::url($path);
        }

        // cover
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

        return Inertia::render('produk-digital/Show', [
            'produk' => $this->formatProdukDetail($produk),
        ]);
    }

    public function update(Request $request, $id)
    {
        $produk = ProdukDigital::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $request->validate([
            'nama'     => 'required|string|max:200',
            'kategori' => 'nullable|in:e-book,novel,komik,template,tulisan,video',
        ]);

        $data = $request->only([
            'nama',
            'deskripsi',
            'kategori',
            'harga',
            'harga_coret',
            'redirect_url',
            'catatan',
            'max_pembayaran',
            'bisa_affiliate',
        ]);

        // update slug kalau nama berubah
        if ($request->nama !== $produk->nama) {
            $data['slug'] = $this->generateUniqueSlug($request->nama);
        }

        // replace file
        if ($request->hasFile('file')) {
            if ($produk->file_path) {
                Storage::disk('public')->delete($produk->file_path);
            }

            $path = $request->file('file')->store('produk-digital/files', 'public');
            $data['file_path'] = $path;
            $data['file_url']  = Storage::url($path);
        }

        // replace cover
        if ($request->hasFile('cover')) {
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
            'redirect_url'       => $p->redirect_url,
            'cover_url'          => $p->cover_url,
            'waktu_mulai_jual'   => $p->waktu_mulai_jual
                ? Carbon::parse($p->waktu_mulai_jual)->format('d M Y H:i')
                : null,
            'tanggal_kadaluarsa' => $p->tanggal_kadaluarsa
                ? Carbon::parse($p->tanggal_kadaluarsa)->format('d M Y')
                : null,
            'catatan'            => $p->catatan,
            'max_pembayaran'     => $p->max_pembayaran,
            'bisa_affiliate'     => (bool) $p->bisa_affiliate,
            'total_penjualan'    => $p->total_penjualan,
            'created_at'         => $p->created_at?->format('d M Y'),
        ];
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
                'kategori' => 'Produk Digital',
            ]);

        return Inertia::render('produk-digital/catalog', [
            'produk' => $produk,
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