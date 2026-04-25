<?php

namespace App\Http\Controllers;

use App\Models\CoachingMentoring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CoachingMentoringController extends Controller
{
    /**
     * Display a listing of coaching/mentoring sessions
     */
    public function index()
    {
        $coachings = CoachingMentoring::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get([
                'id',
                'nama',
                'status',
                'tipe_pembayaran',
                'harga',
                'booking_url',
                'total_penjualan',
            ]);

        return Inertia::render('coaching-mentoring/index', [
            'coachings' => $coachings,
        ]);
    }

    /**
     * Show the form for creating a new resource
     */
    public function create()
    {
        return Inertia::render('coaching-mentoring/create');
    }

    /**
     * Store a newly created coaching/mentoring session
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'               => 'required|string|max:255',
            'deskripsi'          => 'required|string',
            'booking_url'        => 'required|url|max:500',
            'tipe_pembayaran'    => 'required|in:berbayar,gratis',
            'harga'              => 'nullable|integer|min:0',
            'harga_coret'        => 'nullable|integer|min:0|gt:harga',
            'cover'              => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'waktu_mulai_jual'   => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after:waktu_mulai_jual',
            'max_pembayaran'     => 'nullable|integer|min:1',
            'instruksi'          => 'nullable|string',
            'syarat_ketentuan'   => 'nullable|string',
            'bisa_affiliate'     => 'nullable|boolean',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('coaching-mentoring/covers', 'public');
        }

        $coaching = CoachingMentoring::create([
            'user_id'            => Auth::id(),
            'nama'               => $validated['nama'],
            'deskripsi'          => $validated['deskripsi'],
            'booking_url'        => $validated['booking_url'],
            'tipe_pembayaran'    => $validated['tipe_pembayaran'],
            'harga'              => $validated['harga'] ?? 0,
            'harga_coret'        => $validated['harga_coret'] ?? null,
            'cover'              => $coverPath,
            'waktu_mulai_jual'   => $validated['waktu_mulai_jual'] ?? null,
            'tanggal_kadaluarsa' => $validated['tanggal_kadaluarsa'] ?? null,
            'max_pembayaran'     => $validated['max_pembayaran'] ?? null,
            'instruksi'          => $validated['instruksi'] ?? null,
            'syarat_ketentuan'   => $validated['syarat_ketentuan'] ?? null,
            'bisa_affiliate'     => $request->boolean('bisa_affiliate'),
            'status'             => 'unpublished',
            'total_penjualan'    => 0,
        ]);

        return redirect()->route('coaching-mentoring.show', $coaching->id);
    }

    /**
     * Display the specified coaching/mentoring session
     */
    public function show(CoachingMentoring $coachingMentoring)
    {
        if ($coachingMentoring->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('coaching-mentoring/detail', [
            'coaching' => $coachingMentoring,
        ]);
    }

    /**
     * Show the form for editing the specified resource
     */
    public function edit(CoachingMentoring $coachingMentoring)
    {
        if ($coachingMentoring->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('coaching-mentoring/detail', [
            'coaching' => $coachingMentoring,
        ]);
    }

    /**
     * Update the specified resource in storage
     */
    public function update(Request $request, CoachingMentoring $coachingMentoring)
    {
        if ($coachingMentoring->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama'               => 'required|string|max:255',
            'deskripsi'          => 'required|string',
            'booking_url'        => 'required|url|max:500',
            'tipe_pembayaran'    => 'required|in:berbayar,gratis',
            'harga'              => 'nullable|integer|min:0',
            'harga_coret'        => 'nullable|integer|min:0|gt:harga',
            'cover'              => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'waktu_mulai_jual'   => 'nullable|date',
            'tanggal_kadaluarsa' => 'nullable|date|after:waktu_mulai_jual',
            'max_pembayaran'     => 'nullable|integer|min:1',
            'instruksi'          => 'nullable|string',
            'syarat_ketentuan'   => 'nullable|string',
            'bisa_affiliate'     => 'nullable|boolean',
        ]);

        // Handle cover update
        if ($request->hasFile('cover')) {
            if ($coachingMentoring->cover) {
                Storage::disk('public')->delete($coachingMentoring->cover);
            }
            $validated['cover'] = $request->file('cover')->store('coaching-mentoring/covers', 'public');
        }

        $coachingMentoring->update([
            'nama'               => $validated['nama'],
            'deskripsi'          => $validated['deskripsi'],
            'booking_url'        => $validated['booking_url'],
            'tipe_pembayaran'    => $validated['tipe_pembayaran'],
            'harga'              => $validated['harga'] ?? 0,
            'harga_coret'        => $validated['harga_coret'] ?? null,
            'cover'              => $validated['cover'] ?? $coachingMentoring->cover,
            'waktu_mulai_jual'   => $validated['waktu_mulai_jual'] ?? null,
            'tanggal_kadaluarsa' => $validated['tanggal_kadaluarsa'] ?? null,
            'max_pembayaran'     => $validated['max_pembayaran'] ?? null,
            'instruksi'          => $validated['instruksi'] ?? null,
            'syarat_ketentuan'   => $validated['syarat_ketentuan'] ?? null,
            'bisa_affiliate'     => $request->boolean('bisa_affiliate'),
        ]);

        return redirect()->route('coaching-mentoring.show', $coachingMentoring->id);
    }

    /**
     * Remove the specified resource from storage
     */
    public function destroy(CoachingMentoring $coachingMentoring)
    {
        if ($coachingMentoring->user_id !== Auth::id()) {
            abort(403);
        }

        if ($coachingMentoring->cover) {
            Storage::disk('public')->delete($coachingMentoring->cover);
        }

        $coachingMentoring->delete();

        return redirect()->route('coaching-mentoring.index');
    }

    /**
     * Update status of coaching/mentoring session
     */
    public function updateStatus(Request $request, CoachingMentoring $coachingMentoring)
    {
        if ($coachingMentoring->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $coachingMentoring->update(['status' => $validated['status']]);

        return back()->with('success', 'Status updated successfully');
    }

    /**
     * Duplicate coaching/mentoring session
     */
    public function duplicate(CoachingMentoring $coachingMentoring)
    {
        if ($coachingMentoring->user_id !== Auth::id()) {
            abort(403);
        }

        $copy = $coachingMentoring->replicate();
        $copy->status = 'unpublished';
        $copy->nama = $copy->nama . ' (Copy)';
        $copy->user_id = Auth::id();
        $copy->total_penjualan = 0;
        $copy->save();

        return redirect()->route('coaching-mentoring.show', $copy->id);
    }
}
