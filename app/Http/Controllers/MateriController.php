<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\Bab;
use App\Models\Materi;
use Illuminate\Http\Request;

class MateriController extends Controller
{
    public function store(Request $request, Bootcamp $bootcamp, Bab $bab)
    {
        abort_if($bab->bootcamp_id !== $bootcamp->id, 403);

        $validated = $request->validate([
            'judul'  => 'required|string|max:255',
            'tipe'   => 'required|in:video,dokumen,link,teks',
            'konten' => 'nullable|string',
            'durasi' => 'nullable|string|max:20',
        ]);

        $urutan = $bab->materis()->max('urutan') + 1;

        $bab->materis()->create([
            'judul'  => $validated['judul'],
            'tipe'   => $validated['tipe'],
            'konten' => $validated['konten'] ?? null,
            'durasi' => $validated['durasi'] ?? null,
            'urutan' => $urutan,
        ]);

        return back();
    }

    public function update(Request $request, Bootcamp $bootcamp, Bab $bab, Materi $materi)
    {
        abort_if($bab->bootcamp_id !== $bootcamp->id, 403);
        abort_if($materi->bab_id !== $bab->id, 403);

        $validated = $request->validate([
            'judul'  => 'required|string|max:255',
            'tipe'   => 'required|in:video,dokumen,link,teks',
            'konten' => 'nullable|string',
            'durasi' => 'nullable|string|max:20',
        ]);

        $materi->update($validated);

        return back();
    }

    public function destroy(Bootcamp $bootcamp, Bab $bab, Materi $materi)
    {
        abort_if($bab->bootcamp_id !== $bootcamp->id, 403);
        abort_if($materi->bab_id !== $bab->id, 403);

        $materi->delete();

        return back();
    }

    // ─────────────────────────────────────────────
    // KELAS ONLINE
    // ─────────────────────────────────────────────

    public function storeForKelasOnline(Request $request, $kelasId, Bab $bab)
    {
        abort_if($bab->kelas_online_id != $kelasId, 403);

        $validated = $request->validate([
            'judul'  => 'required|string|max:255',
            'tipe'   => 'required|in:video,dokumen,link,teks',
            'konten' => 'nullable|string',
            'durasi' => 'nullable|string|max:20',
        ]);

        $urutan = $bab->materis()->max('urutan') + 1;

        $bab->materis()->create([
            'judul'  => $validated['judul'],
            'tipe'   => $validated['tipe'],
            'konten' => $validated['konten'] ?? null,
            'durasi' => $validated['durasi'] ?? null,
            'urutan' => $urutan,
        ]);

        return back();
    }

    public function updateForKelasOnline(Request $request, $kelasId, Bab $bab, Materi $materi)
    {
        abort_if($bab->kelas_online_id != $kelasId, 403);
        abort_if($materi->bab_id !== $bab->id, 403);

        $validated = $request->validate([
            'judul'  => 'required|string|max:255',
            'tipe'   => 'required|in:video,dokumen,link,teks',
            'konten' => 'nullable|string',
            'durasi' => 'nullable|string|max:20',
        ]);

        $materi->update($validated);

        return back();
    }

    public function destroyForKelasOnline($kelasId, Bab $bab, Materi $materi)
    {
        abort_if($bab->kelas_online_id != $kelasId, 403);
        abort_if($materi->bab_id !== $bab->id, 403);

        $materi->delete();

        return back();
    }
}