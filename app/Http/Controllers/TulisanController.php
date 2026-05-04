<?php

namespace App\Http\Controllers;

use App\Models\Tulisan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TulisanController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();

        $produk = Tulisan::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('tulisan/index', [
            'produk' => $produk,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tulisan/index', [
            'createOpen' => true
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'url' => 'nullable|url|max:255',
            'tipe_tulisan' => 'required|string|in:one_shot,chapter',
            'tipe_pembayaran' => 'nullable|string',
            'mekanisme_bayar' => 'nullable|string',
            'harga' => 'nullable|integer|min:0',
            'deskripsi' => 'nullable|string',
            'tanggal_mulai_jual' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after_or_equal:tanggal_mulai_jual',
            'catatan' => 'nullable|string',
            'max_pembayaran' => 'nullable|integer|min:1',
            'genre' => 'nullable|string|max:255',
            'author' => 'nullable|string|max:255',
            'bahasa' => 'nullable|string|max:255',
            'affiliate_enabled' => 'nullable|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('tulisans/covers', 'public');
        }

        Tulisan::create([
            'user_id' => Auth::id(),
            'nama' => $validated['nama'],
            'url' => $validated['url'] ?? null,
            'tipe_tulisan' => $validated['tipe_tulisan'],
            'tipe_pembayaran' => $validated['tipe_pembayaran'] ?? null,
            'mekanisme_bayar' => $validated['mekanisme_bayar'] ?? null,
            'harga' => $validated['harga'] ?? 0,
            'deskripsi' => $validated['deskripsi'] ?? null,
            'cover' => $coverPath,
            'tanggal_mulai_jual' => $validated['tanggal_mulai_jual'] ?? null,
            'tanggal_kadaluarsa' => $validated['tanggal_kadaluarsa'] ?? null,
            'catatan' => $validated['catatan'] ?? null,
            'max_pembayaran' => $validated['max_pembayaran'] ?? null,
            'genre' => $validated['genre'] ?? null,
            'author' => $validated['author'] ?? null,
            'bahasa' => $validated['bahasa'] ?? null,
            'affiliate_enabled' => $request->boolean('affiliate_enabled'),
            'status' => 'unpublished',
            'terjual' => 0,
        ]);

        return redirect()->route('tulisan.index');
    }

    public function show(Tulisan $tulisan): Response
    {
        if ($tulisan->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('tulisan/detail', [
            'tulisan' => $tulisan,
        ]);
    }

    public function edit(Tulisan $tulisan): Response
    {
        return Inertia::render('tulisan/detail', [
            'tulisan' => $tulisan,
            'isEdit' => true
        ]);
    }

    public function update(Request $request, Tulisan $tulisan)
    {
        if ($tulisan->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'tipe_tulisan' => 'required|string|in:one_shot,chapter',
            'tipe_pembayaran' => 'nullable|string',
            'mekanisme_bayar' => 'nullable|string',
            'harga' => 'nullable|integer|min:0',
            'deskripsi' => 'nullable|string',
            'tanggal_mulai_jual' => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after_or_equal:tanggal_mulai_jual',
            'catatan' => 'nullable|string',
            'max_pembayaran' => 'nullable|integer|min:1',
            'genre' => 'nullable|string|max:255',
            'author' => 'nullable|string|max:255',
            'bahasa' => 'nullable|string|max:255',
            'affiliate_enabled' => 'nullable|boolean',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('cover')) {
            if ($tulisan->cover) {
                Storage::disk('public')->delete($tulisan->cover);
            }
            $validated['cover'] = $request->file('cover')->store('tulisans/covers', 'public');
        }

        if ($request->has('affiliate_enabled')) {
            $validated['affiliate_enabled'] = $request->boolean('affiliate_enabled');
        }

        $tulisan->update($validated);

        return back();
    }

    public function destroy(Tulisan $tulisan)
    {
        if ($tulisan->user_id !== Auth::id()) {
            abort(403);
        }

        if ($tulisan->cover) {
            Storage::disk('public')->delete($tulisan->cover);
        }

        $tulisan->delete();

        return redirect()->route('tulisan.index')
            ->with('success', 'Tulisan berhasil dihapus.');
    }

    public function toggleStatus(Request $request, Tulisan $tulisan)
    {
        if ($tulisan->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $tulisan->update(['status' => $request->status]);

        return back()->with('success', 'Status tulisan diperbarui.');
    }

    public function duplicate(Tulisan $tulisan)
    {
        if ($tulisan->user_id !== Auth::id()) {
            abort(403);
        }

        $copy = $tulisan->replicate();
        $copy->user_id = Auth::id();
        $copy->nama = $tulisan->nama . ' (Copy)';
        $copy->status = 'unpublished';
        $copy->terjual = 0;
        $copy->save();

        return redirect()->route('tulisan.show', $copy->id);
    }

    public function catalog()
    {
        $userId = Auth::id();
        $tulisans = Tulisan::where('user_id', $userId)
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($t) => [
                'id' => "tulisan:{$t->id}",
                'product_id' => $t->id,
                'type' => 'tulisan',
                'nama' => $t->nama,
                'harga' => $t->harga ?? 0,
                'status' => $t->status,
                'tanggal' => $t->created_at->format('d M Y H:i'),
                'terjual' => $t->terjual ?? 0,
                'kategori' => 'Tulisan',
            ]);

        return Inertia::render('tulisan/catalog', [
            'produk' => $tulisans,
        ]);
    }

    public function publicShow(Tulisan $tulisan): Response
    {
        if ($tulisan->status !== 'published') {
            abort(404);
        }

        return Inertia::render('tulisan/public', [
            'tulisan' => $tulisan,
        ]);
    }
}
