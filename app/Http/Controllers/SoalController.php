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
            'image'         => 'nullable|image|max:2048',
            'show_image'    => 'nullable',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('soal-images', 'public');
        }

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
            'image'         => $imagePath,
            'show_image'    => filter_var($request->show_image, FILTER_VALIDATE_BOOLEAN),
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
            'image'         => 'nullable|image|max:2048',
            'show_image'    => 'nullable',
        ]);

        $data = [
            'pertanyaan'    => $request->pertanyaan,
            'tipe_soal'     => $request->tipe_soal,
            'show_image'    => filter_var($request->show_image, FILTER_VALIDATE_BOOLEAN),
        ];

        if ($request->hasFile('image')) {
            // Hapus yang lama jika ada
            if ($soal->image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($soal->image);
            }
            $data['image'] = $request->file('image')->store('soal-images', 'public');
        }

        // Filter pilihan kosong
        $pilihan = null;
        if ($request->tipe_soal === 'pilihan_ganda' && $request->pilihan) {
            $pilihan = array_values(array_filter($request->pilihan, fn($p) => !empty(trim($p))));
            if (count($pilihan) < 2) {
                return back()->withErrors(['pilihan' => 'Minimal 2 pilihan jawaban harus diisi.']);
            }
        }

        $data['pilihan']       = $pilihan;
        $data['jawaban_benar'] = $request->tipe_soal === 'pilihan_ganda' ? $request->jawaban_benar : null;

        $soal->update($data);

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