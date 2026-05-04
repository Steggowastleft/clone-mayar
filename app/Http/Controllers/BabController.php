<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\Bab;
use Illuminate\Http\Request;

class BabController extends Controller
{
    public function store(Request $request, Bootcamp $bootcamp)
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $urutan = $bootcamp->babs()->max('urutan') + 1;

        $bootcamp->babs()->create([
            'judul'     => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'urutan'    => $urutan,
        ]);

        return back();
    }

    public function update(Request $request, Bootcamp $bootcamp, Bab $bab)
    {
        abort_if($bab->bootcamp_id !== $bootcamp->id, 403);

        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $bab->update($validated);

        return back();
    }

    public function destroy(Bootcamp $bootcamp, Bab $bab)
    {
        abort_if($bab->bootcamp_id !== $bootcamp->id, 403);
        $bab->delete();
        return back();
    }

    // ─────────────────────────────────────────────
    // KELAS ONLINE
    // ─────────────────────────────────────────────

    public function storeForKelasOnline(Request $request, $kelasId)
    {
        $kelas = \App\Models\KelasOnline::findOrFail($kelasId);
        
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $urutan = $kelas->babs()->max('urutan') + 1;

        $kelas->babs()->create([
            'judul'     => $validated['judul'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'urutan'    => $urutan,
        ]);

        return back();
    }

    public function updateForKelasOnline(Request $request, $kelasId, Bab $bab)
    {
        abort_if($bab->kelas_online_id != $kelasId, 403);

        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $bab->update($validated);

        return back();
    }

    public function destroyForKelasOnline($kelasId, Bab $bab)
    {
        abort_if($bab->kelas_online_id != $kelasId, 403);
        $bab->delete();
        return back();
    }
}