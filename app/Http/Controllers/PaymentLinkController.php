<?php

namespace App\Http\Controllers;

use App\Models\PaymentLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentLinkController extends Controller
{
    // ─────────────────────────────────────────────────────
    // Index – daftar semua payment link milik user
    // ─────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = PaymentLink::where('user_id', Auth::id())
            ->orderByDesc('created_at');

        // Filter status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter search
        if ($request->filled('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        $links = $query->get()->map(fn ($l) => [
            'id'          => $l->id,
            'nama'        => $l->nama,
            'harga'       => $l->harga,
            'harga_coret' => $l->harga_coret,
            'status'      => $l->status,
            'slug'        => $l->slug,
            'cover_url'   => $l->cover_url,
            'created_at'  => $l->created_at->format('d M Y'),
            'tanggal_kadaluarsa' => $l->tanggal_kadaluarsa?->format('d M Y'),
            'maksimum_pembayaran' => $l->maksimum_pembayaran,
            'bisa_affiliate' => $l->bisa_affiliate,
        ]);

        return Inertia::render('PaymentLink/Index', [
            'links' => $links,
        ]);
    }

    // ─────────────────────────────────────────────────────
    // Store – buat payment link baru
    // ─────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'                => 'required|string|max:150',
            'harga'               => 'required|integer|min:0',
            'harga_coret'         => 'nullable|integer|gt:harga',
            'deskripsi'           => 'required|string',
            'cover'               => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4|max:10240',
            'waktu_mulai_jual'    => 'nullable|date',
            'tanggal_kadaluarsa'  => 'nullable|date',
            'pesan_setelah_bayar' => 'nullable|string|max:2000',
            'maksimum_pembayaran' => 'nullable|integer|min:1',
            'redirect_url'        => 'nullable|url|max:255',
            'bisa_affiliate'      => 'nullable|in:0,1',
        ]);

        $coverPath = null;
        $coverUrl  = null;

        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('payment-links/covers', 'public');
            $coverUrl  = Storage::url($coverPath);
        }

        $link = PaymentLink::create([
            'user_id'             => Auth::id(),
            'nama'                => $validated['nama'],
            'harga'               => $validated['harga'],
            'harga_coret'         => $validated['harga_coret'] ?? null,
            'deskripsi'           => $validated['deskripsi'],
            'cover'               => $coverPath,
            'cover_url'           => $coverUrl,
            'waktu_mulai_jual'    => $validated['waktu_mulai_jual'] ?? null,
            'tanggal_kadaluarsa'  => $validated['tanggal_kadaluarsa'] ?? null,
            'pesan_setelah_bayar' => $validated['pesan_setelah_bayar'] ?? null,
            'maksimum_pembayaran' => $validated['maksimum_pembayaran'] ?? null,
            'redirect_url'        => $validated['redirect_url'] ?? null,
            'bisa_affiliate'      => ($request->input('bisa_affiliate') == '1'),
            'status'              => 'published',
        ]);

        return redirect()->route('payment-link.show', $link->id)
            ->with('success', 'Link pembayaran berhasil dibuat.');
    }

    // ─────────────────────────────────────────────────────
    // Show – halaman detail payment link
    // ─────────────────────────────────────────────────────
   public function show(PaymentLink $paymentLink)
{
    return Inertia::render('PaymentLink/Show', [
        'link' => $this->formatLink($paymentLink),
    ]);
}

public function update(Request $request, PaymentLink $paymentLink)
{
    $validated = $request->validate([
        'nama'                => 'sometimes|required|string|max:150',
        'harga'               => 'sometimes|required|integer|min:0',
        'harga_coret'         => 'nullable|integer',
        'deskripsi'           => 'sometimes|required|string',
        'cover'               => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4|max:10240',
        'waktu_mulai_jual'    => 'nullable|date',
        'tanggal_kadaluarsa'  => 'nullable|date',
        'pesan_setelah_bayar' => 'nullable|string|max:2000',
        'maksimum_pembayaran' => 'nullable|integer|min:1',
        'redirect_url'        => 'nullable|url|max:255',
        'bisa_affiliate'      => 'nullable|in:0,1',
        'status'              => 'nullable|in:published,unpublished,unlisted',
    ]);

    if ($request->hasFile('cover')) {
        if ($paymentLink->cover) {
            Storage::disk('public')->delete($paymentLink->cover);
        }

        $validated['cover']     = $request->file('cover')->store('payment-links/covers', 'public');
        $validated['cover_url'] = Storage::url($validated['cover']);
    }

    if ($request->has('bisa_affiliate')) {
        $validated['bisa_affiliate'] = ($request->input('bisa_affiliate') == '1');
    }

    $paymentLink->update($validated);

    return back()->with('success', 'Link pembayaran berhasil diperbarui.');
}

public function destroy(PaymentLink $paymentLink)
{
    $paymentLink->delete();

    return redirect()->route('payment-link.index')
        ->with('success', 'Link pembayaran berhasil dihapus.');
}

    // ─────────────────────────────────────────────────────
    // Catalog – daftar payment links yang dipublikasi
    // ─────────────────────────────────────────────────────
    public function catalog(): Response
    {
        $links = PaymentLink::where('user_id', Auth::id())
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($l) => [
                'id' => "payment-link:{$l->id}",
                'product_id' => $l->id,
                'type' => 'payment-link',
                'nama' => $l->nama,
                'harga' => $l->harga ?? 0,
                'status' => $l->status,
                'tanggal' => $l->created_at->format('d M Y H:i'),
                'terjual' => 0,
                'kategori' => 'Link Pembayaran',
            ]);

        return Inertia::render('payment-link/catalog', [
            'produk' => $links,
        ]);
    }

    // ─────────────────────────────────────────────────────
    // Public Show – tampilkan payment link untuk public
    // ─────────────────────────────────────────────────────
    public function publicShow(PaymentLink $paymentLink): Response
    {
        if ($paymentLink->status !== 'published') {
            abort(404);
        }

        return Inertia::render('payment-link/public', [
            'link' => $this->formatLink($paymentLink),
        ]);
    }

    // ─────────────────────────────────────────────────────
    // Helper – format link untuk Inertia
    // ─────────────────────────────────────────────────────
    private function formatLink(PaymentLink $l): array
    {
        return [
            'id'                  => $l->id,
            'nama'                => $l->nama,
            'harga'               => $l->harga,
            'harga_coret'         => $l->harga_coret,
            'deskripsi'           => $l->deskripsi,
            'cover'               => $l->cover,
            'cover_url'           => $l->cover_url,
            'waktu_mulai_jual'    => $l->waktu_mulai_jual?->format('d M Y HH:mm'),
            'tanggal_kadaluarsa'  => $l->tanggal_kadaluarsa?->format('d M Y'),
            'pesan_setelah_bayar' => $l->pesan_setelah_bayar,
            'maksimum_pembayaran' => $l->maksimum_pembayaran,
            'redirect_url'        => $l->redirect_url,
            'bisa_affiliate'      => $l->bisa_affiliate,
            'status'              => $l->status,
            'slug'                => $l->slug,
            'created_at'          => $l->created_at->format('d M Y'),
        ];
    }
}