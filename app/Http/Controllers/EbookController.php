<?php

namespace App\Http\Controllers;

use App\Models\Ebook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EbookController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();

        $produk = Ebook::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('ebook/index', [
            'produk' => $produk,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('ebook/index', [
            'createOpen' => true
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'tipe_pembayaran' => 'nullable|string',
            'harga' => 'nullable|integer|min:0',
            'harga_coret' => 'nullable|integer|min:0',
            'deskripsi' => 'nullable|string',
            'tanggal_mulai_jual' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after_or_equal:tanggal_mulai_jual',
            'catatan' => 'nullable|string',
            'max_pembayaran' => 'nullable|integer|min:1',
            'sumber_file' => 'required|string',
            'file_url' => 'nullable|string',
            'bisa_didownload' => 'nullable|boolean',
            'author' => 'nullable|string|max:255',
            'isbn' => 'nullable|string|max:255',
            'format' => 'nullable|string',
            'bahasa' => 'nullable|string|max:255',
            'jumlah_halaman' => 'nullable|integer|min:1',
            'tanggal_publish' => 'nullable|date',
            'affiliate_enabled' => 'nullable|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'file' => 'nullable|file|max:102400',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('ebooks/covers', 'public');
        }

        $fileUrl = $validated['file_url'] ?? null;
        if ($validated['sumber_file'] === 'upload' && $request->hasFile('file')) {
            $fileUrl = $request->file('file')->store('ebooks/files', 'public');
        }

        Ebook::create([
            'user_id' => Auth::id(),
            'nama' => $validated['nama'],
            'url' => $validated['url'] ?? null,
            'tipe_pembayaran' => $validated['tipe_pembayaran'] ?? null,
            'harga' => $validated['harga'] ?? 0,
            'harga_coret' => $validated['harga_coret'] ?? null,
            'deskripsi' => $validated['deskripsi'] ?? null,
            'cover' => $coverPath,
            'tanggal_mulai_jual' => $validated['tanggal_mulai_jual'] ?? null,
            'tanggal_kadaluarsa' => $validated['tanggal_kadaluarsa'] ?? null,
            'catatan' => $validated['catatan'] ?? null,
            'max_pembayaran' => $validated['max_pembayaran'] ?? null,
            'sumber_file' => $validated['sumber_file'],
            'file_url' => $fileUrl,
            'bisa_didownload' => $request->boolean('bisa_didownload', true),
            'author' => $validated['author'] ?? null,
            'isbn' => $validated['isbn'] ?? null,
            'format' => $validated['format'] ?? null,
            'bahasa' => $validated['bahasa'] ?? null,
            'jumlah_halaman' => $validated['jumlah_halaman'] ?? null,
            'tanggal_publish' => $validated['tanggal_publish'] ?? null,
            'affiliate_enabled' => $request->boolean('affiliate_enabled'),
            'status' => 'unpublished',
            'terjual' => 0,
        ]);

        return redirect()->route('ebook.index');
    }

    public function show(Ebook $ebook): Response
    {
        if ($ebook->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('ebook/detail', [
            'ebook' => $ebook,
        ]);
    }

    public function edit(Ebook $ebook): Response
    {
        if ($ebook->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('ebook/detail', [
            'ebook' => $ebook,
            'isEdit' => true
        ]);
    }

    public function update(Request $request, Ebook $ebook)
    {
        if ($ebook->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'tipe_pembayaran' => 'nullable|string',
            'harga' => 'nullable|integer|min:0',
            'harga_coret' => 'nullable|integer|min:0',
            'deskripsi' => 'nullable|string',
            'tanggal_mulai_jual' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after_or_equal:tanggal_mulai_jual',
            'catatan' => 'nullable|string',
            'max_pembayaran' => 'nullable|integer|min:1',
            'sumber_file' => 'required|string',
            'file_url' => 'nullable|string',
            'bisa_didownload' => 'nullable|boolean',
            'author' => 'nullable|string|max:255',
            'isbn' => 'nullable|string|max:255',
            'format' => 'nullable|string',
            'bahasa' => 'nullable|string|max:255',
            'jumlah_halaman' => 'nullable|integer|min:1',
            'tanggal_publish' => 'nullable|date',
            'affiliate_enabled' => 'nullable|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'file' => 'nullable|file|max:102400',
        ]);

        if ($request->hasFile('cover')) {
            if ($ebook->cover) {
                Storage::disk('public')->delete($ebook->cover);
            }
            $validated['cover'] = $request->file('cover')->store('ebooks/covers', 'public');
        }

        if ($request->has('affiliate_enabled')) {
            $validated['affiliate_enabled'] = $request->boolean('affiliate_enabled');
        }

        if ($request->has('bisa_didownload')) {
            $validated['bisa_didownload'] = $request->boolean('bisa_didownload');
        }

        if ($validated['sumber_file'] === 'upload') {
            if ($request->hasFile('file')) {
                if ($ebook->sumber_file === 'upload' && $ebook->file_url) {
                    Storage::disk('public')->delete($ebook->file_url);
                }
                $validated['file_url'] = $request->file('file')->store('ebooks/files', 'public');
            } else {
                // Keep the old file_url if no new file is uploaded
                $validated['file_url'] = $ebook->file_url;
            }
        } else {
            if ($ebook->sumber_file === 'upload' && $ebook->file_url) {
                Storage::disk('public')->delete($ebook->file_url);
            }
        }

        $ebook->update($validated);

        return back();
    }

    public function destroy(Ebook $ebook)
    {
        if ($ebook->user_id !== Auth::id()) {
            abort(403);
        }

        if ($ebook->cover) {
            Storage::disk('public')->delete($ebook->cover);
        }

        if ($ebook->sumber_file === 'upload' && $ebook->file_url) {
            Storage::disk('public')->delete($ebook->file_url);
        }

        $ebook->delete();

        return redirect()->route('ebook.index')
            ->with('success', 'Ebook berhasil dihapus.');
    }

    public function toggleStatus(Request $request, Ebook $ebook)
    {
        if ($ebook->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $ebook->update(['status' => $request->status]);

        return back()->with('success', 'Status ebook diperbarui.');
    }

    public function duplicate(Ebook $ebook)
    {
        if ($ebook->user_id !== Auth::id()) {
            abort(403);
        }

        $copy = $ebook->replicate();
        $copy->user_id = Auth::id();
        $copy->nama = $ebook->nama . ' (Copy)';
        $copy->status = 'unpublished';
        $copy->terjual = 0;
        $copy->save();

        return redirect()->route('ebook.show', $copy->id);
    }

    public function catalog(): Response
    {
        $userId = Auth::id();
        $ebooks = Ebook::where('status', 'published')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($e) => [
                'id' => "ebook:{$e->id}",
                'product_id' => $e->id,
                'type' => 'ebook',
                'nama' => $e->nama,
                'harga' => $e->harga ?? 0,
                'status' => $e->status,
                'tanggal' => $e->created_at->format('d M Y H:i'),
                'terjual' => $e->terjual ?? 0,
                'kategori' => 'Ebook',
            ]);

        return Inertia::render('ebook/catalog', [
            'produk' => $ebooks,
        ]);
    }

    public function publicShow(Ebook $ebook): Response
    {
        if ($ebook->status !== 'published') {
            abort(404);
        }

        return Inertia::render('ebook/public', [
            'ebook' => $ebook,
        ]);
    }
}
