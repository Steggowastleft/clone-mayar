<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assignment;
use App\Models\Soal;

class SoalController extends Controller
{
    public function store(Request $request, Assignment $assignment)
    {
        $validated = $request->validate([
            'pertanyaan'    => 'required|string',
            'tipe_soal'     => 'required|in:pilihan_ganda,essay',
            'pilihan'       => 'nullable|array',
            'pilihan.*'     => 'nullable|string|max:500',
            'jawaban_benar' => 'nullable|string',
            'urutan'        => 'nullable|integer',
        ]);

        // Filter pilihan kosong
        $pilihan = null;
        if ($request->tipe_soal === 'pilihan_ganda' && $request->pilihan) {
            $pilihan = array_values(array_filter($request->pilihan, fn($p) => !empty(trim($p))));
            if (count($pilihan) < 2) {
                return back()->withErrors(['pilihan' => 'Minimal 2 pilihan jawaban harus diisi.']);
            }
        }

        Soal::create([
            'assignment_id' => $assignment->id,
            'pertanyaan'    => $request->pertanyaan,
            'tipe_soal'     => $request->tipe_soal,
            'pilihan'       => $pilihan,
            'jawaban_benar' => $request->tipe_soal === 'pilihan_ganda' ? $request->jawaban_benar : null,
            'urutan'        => $request->urutan ?? Soal::where('assignment_id', $assignment->id)->count(),
        ]);

        return back()->with('success', 'Soal berhasil ditambahkan.');
    }

    public function update(Request $request, Assignment $assignment, Soal $soal)
    {
        $request->validate([
            'pertanyaan'    => 'required|string',
            'tipe_soal'     => 'required|in:pilihan_ganda,essay',
            'pilihan'       => 'nullable|array',
            'pilihan.*'     => 'nullable|string|max:500',
            'jawaban_benar' => 'nullable|string',
        ]);

        // Filter pilihan kosong
        $pilihan = null;
        if ($request->tipe_soal === 'pilihan_ganda' && $request->pilihan) {
            $pilihan = array_values(array_filter($request->pilihan, fn($p) => !empty(trim($p))));
            if (count($pilihan) < 2) {
                return back()->withErrors(['pilihan' => 'Minimal 2 pilihan jawaban harus diisi.']);
            }
        }

        $soal->update([
            'pertanyaan'    => $request->pertanyaan,
            'tipe_soal'     => $request->tipe_soal,
            'pilihan'       => $pilihan,
            'jawaban_benar' => $request->tipe_soal === 'pilihan_ganda' ? $request->jawaban_benar : null,
        ]);

        return back()->with('success', 'Soal berhasil diperbarui.');
    }

    public function destroy(Assignment $assignment, Soal $soal)
    {
    if ($soal->assignment_id !== $assignment->id) {
        abort(404);
    }

    $soal->delete();

    return back()->with('success', 'Soal berhasil dihapus.');
    }
}