<?php

namespace App\Http\Controllers;

use App\Models\KelasOnline;
use App\Models\KelasOnlineMeeting;
use Illuminate\Http\Request;

class KelasOnlineMeetingController extends Controller
{
    /**
     * Store a newly created meeting in storage.
     */
    public function store(Request $request, $kelas_online_id)
    {
        $kelas = KelasOnline::findOrFail($kelas_online_id);

        $validated = $request->validate([
            'judul'           => 'required|string|max:255',
            'deskripsi'       => 'nullable|string',
            'link_zoom'       => 'nullable|string|max:500',
            'nama_pemateri'   => 'nullable|string|max:255',
            'profil_pemateri' => 'nullable|string',
            'waktu_mulai'     => 'nullable|date',
            'waktu_selesai'   => 'nullable|date',
        ]);

        $kelas->meetings()->create($validated);

        return back()->with('success', 'Sesi berhasil ditambahkan.');
    }

    /**
     * Update the specified meeting in storage.
     */
    public function update(Request $request, $kelas_online_id, $id)
    {
        $meeting = KelasOnlineMeeting::where('kelas_online_id', $kelas_online_id)->findOrFail($id);

        $validated = $request->validate([
            'judul'           => 'required|string|max:255',
            'deskripsi'       => 'nullable|string',
            'link_zoom'       => 'nullable|string|max:500',
            'nama_pemateri'   => 'nullable|string|max:255',
            'profil_pemateri' => 'nullable|string',
            'waktu_mulai'     => 'nullable|date',
            'waktu_selesai'   => 'nullable|date',
        ]);

        $meeting->update($validated);

        return back()->with('success', 'Sesi berhasil diperbarui.');
    }

    /**
     * Remove the specified meeting from storage.
     */
    public function destroy($kelas_online_id, $id)
    {
        $meeting = KelasOnlineMeeting::where('kelas_online_id', $kelas_online_id)->findOrFail($id);
        $meeting->delete();

        return back()->with('success', 'Sesi berhasil dihapus.');
    }
}
