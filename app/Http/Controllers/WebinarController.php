<?php

namespace App\Http\Controllers;

use App\Models\Webinar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WebinarController extends Controller
{
    /**
     * Display a listing of webinars.
     */
    public function index()
    {
        $userId = Auth::id();

        $webinars = Webinar::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($w) => [
                'id'              => $w->id,
                'nama'            => $w->nama,
                'status'          => $w->status,
                'tanggal_mulai'   => $w->tanggal_mulai ? $w->tanggal_mulai->format('Y-m-d H:i:s') : null,
                'tanggal_selesai' => $w->tanggal_selesai ? $w->tanggal_selesai->format('Y-m-d H:i:s') : null,
                'peserta'         => $w->peserta,
                'max_peserta'     => $w->max_peserta,
                'harga'           => $w->harga,
                'url'             => $w->url,
                'cover_url'       => $w->cover_url,
                'created_at'      => $w->created_at ? $w->created_at->format('Y-m-d H:i:s') : null,
            ]);

        return Inertia::render('webinar/index', [
            'webinars' => $webinars,
        ]);
    }

    /**
     * Store a newly created webinar.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'                  => 'required|string|max:255',
            'deskripsi'             => 'nullable|string',
            'url'                   => 'nullable|url|max:255',
            'harga'                 => 'nullable|integer|min:0',
            'harga_coret'           => 'nullable|integer|min:0|gt:harga',
            'instruksi'             => 'nullable|string',
            'syarat_ketentuan'      => 'nullable|string',
            'max_peserta'           => 'nullable|integer|min:1',
            'redirect_url'          => 'nullable|url|max:255',
            'timezone'              => 'nullable|string|max:50',
            'affiliate_enabled'     => 'nullable|boolean',
            'tanggal_mulai'         => 'nullable|date',
            'tanggal_selesai'       => 'nullable|date|after_or_equal:tanggal_mulai',
            'tanggal_mulai_jual'    => 'nullable|date',
            'tanggal_tutup_daftar'  => 'nullable|date',
            'cover'                 => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('webinars/covers', 'public');
        }

        $webinar = Webinar::create([
            'user_id'               => Auth::id(), // 🔥 FIX UTAMA
            'nama'                  => $validated['nama'],
            'deskripsi'             => $validated['deskripsi'] ?? null,
            'url'                   => $validated['url'] ?? null,
            'harga'                 => $validated['harga'] ?? 0,
            'harga_coret'           => $validated['harga_coret'] ?? null,
            'instruksi'             => $validated['instruksi'] ?? null,
            'syarat_ketentuan'      => $validated['syarat_ketentuan'] ?? null,
            'max_peserta'           => $validated['max_peserta'] ?? null,
            'redirect_url'          => $validated['redirect_url'] ?? null,
            'timezone'              => $validated['timezone'] ?? 'Asia/Jakarta',
            'affiliate_enabled'     => $request->boolean('affiliate_enabled'),
            'tanggal_mulai'         => $validated['tanggal_mulai'] ?? null,
            'tanggal_selesai'       => $validated['tanggal_selesai'] ?? null,
            'tanggal_mulai_jual'    => $validated['tanggal_mulai_jual'] ?? null,
            'tanggal_tutup_daftar'  => $validated['tanggal_tutup_daftar'] ?? null,
            'cover'                 => $coverPath,
            'status'                => 'unpublished',
            'peserta'               => 0,
        ]);

        return redirect()->route('webinar.index');
    }

    /**
     * Display the specified webinar.
     */
    public function show(Webinar $webinar)
    {
        // optional: security check
        if ($webinar->user_id !== Auth::id()) {
            abort(403);
        }

        $webinar->load('pembicaras');

        return Inertia::render('webinar/detail', [
            'webinar' => $webinar,
        ]);
    }

    /**
     * Update the specified webinar.
     */
    public function update(Request $request, Webinar $webinar)
    {
        if ($webinar->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'lokasi' => 'nullable|string',
            'link_zoom' => 'nullable|string',
            'harga' => 'nullable|integer|min:0',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'cover' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('cover')) {
            if ($webinar->cover) {
                Storage::disk('public')->delete($webinar->cover);
            }

            $validated['cover'] = $request->file('cover')->store('webinars/covers', 'public');
        }

        $webinar->update($validated);

        return back();
    }

    /**
     * Remove the specified webinar.
     */
    public function destroy(Webinar $webinar)
    {
        if ($webinar->user_id !== Auth::id()) {
            abort(403);
        }

        if ($webinar->cover) {
            Storage::disk('public')->delete($webinar->cover);
        }

        $webinar->delete();

        return redirect()->route('webinar.index')
            ->with('success', 'Webinar berhasil dihapus.');
    }

    /**
     * Toggle publish status.
     */
    public function toggleStatus(Request $request, Webinar $webinar)
    {
        if ($webinar->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $webinar->update(['status' => $request->status]);

        return back()->with('success', 'Status webinar diperbarui.');
    }

    /**
     * Duplicate webinar
     */
    public function duplicate(Webinar $webinar)
    {
        if ($webinar->user_id !== Auth::id()) {
            abort(403);
        }

        $copy = $webinar->replicate();

        $copy->user_id = Auth::id(); // 🔥 WAJIB JUGA DI SINI
        $copy->nama = $webinar->nama . ' (Copy)';
        $copy->status = 'unpublished';
        $copy->peserta = 0;
        $copy->save();

        return redirect()->route('webinar.detail', $copy->id);
    }

    /**
     * Store webinar pembicara
     */
    public function storePembicara(Request $request, Webinar $webinar)
    {
        if ($webinar->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama'      => 'required|string|max:255',
            'pekerjaan' => 'required|string|max:255',
            'profil'    => 'required|string',
            'foto'      => 'nullable|image|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('webinars/pembicara', 'public');
        }

        $webinar->pembicaras()->create([
            'nama'      => $validated['nama'],
            'pekerjaan' => $validated['pekerjaan'],
            'profil'    => $validated['profil'],
            'foto'      => $fotoPath,
        ]);

        return back()->with('success', 'Pembicara berhasil ditambahkan.');
    }
}