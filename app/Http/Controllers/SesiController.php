<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\Sesi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SesiController extends Controller
{
    /**
     * Simpan sesi baru untuk bootcamp tertentu.
     */
    public function store(Request $request, Bootcamp $bootcamp)
    {
        $validated = $request->validate([
            'judul'           => 'required|string|max:255',
            'deskripsi'       => 'nullable|string',
            'is_online'       => 'required|boolean',
            'link_sesi'       => 'nullable|string|max:500',
            'lokasi'          => 'nullable|string|max:500',
            'lat'             => 'nullable|numeric',
            'lng'             => 'nullable|numeric',
            'nama_pemateri'   => 'nullable|string|max:255',
            'profil_pemateri' => 'nullable|string',
            'waktu_mulai'     => 'nullable|date',
            'waktu_selesai'   => 'nullable|date',
        ]);

        $bootcamp->sesis()->create($validated);

        return back();
    }

    /**
     * Update sesi yang sudah ada.
     */
    public function update(Request $request, Bootcamp $bootcamp, Sesi $sesi)
    {
        // Pastikan sesi ini milik bootcamp ini
        abort_if($sesi->bootcamp_id !== $bootcamp->id, 403);

        $validated = $request->validate([
            'judul'           => 'required|string|max:255',
            'deskripsi'       => 'nullable|string',
            'is_online'       => 'required|boolean',
            'link_sesi'       => 'nullable|string|max:500',
            'lokasi'          => 'nullable|string|max:500',
            'lat'             => 'nullable|numeric',
            'lng'             => 'nullable|numeric',
            'nama_pemateri'   => 'nullable|string|max:255',
            'profil_pemateri' => 'nullable|string',
            'waktu_mulai'     => 'nullable|date',
            'waktu_selesai'   => 'nullable|date',
        ]);

        $sesi->update($validated);

        return back();
    }

    /**
     * Hapus sesi.
     */
    public function destroy(Bootcamp $bootcamp, Sesi $sesi)
    {
        abort_if($sesi->bootcamp_id !== $bootcamp->id, 403);

        $sesi->delete();

        return back();
    }
}