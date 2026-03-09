<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LandingController extends Controller
{
    // ─────────────────────────────────────────────
    // INSTRUKTUR
    // ─────────────────────────────────────────────
    public function instruktur(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'instruktur'              => 'required|array|min:1',
            'instruktur.*.nama'       => 'required|string|max:255',
            'instruktur.*.jabatan'    => 'nullable|string|max:255',
            'instruktur.*.bio'        => 'nullable|string',
            'instruktur.*.foto'       => 'nullable|image|max:2048',
        ]);

        // Hapus instruktur lama & fotonya
        foreach ($bootcamp->instruktur as $old) {
            if ($old->foto) {
                Storage::disk('public')->delete($old->foto);
            }
            $old->delete();
        }

        foreach ($request->instruktur as $i => $data) {
            $fotoPath = null;
            if ($request->hasFile("instruktur.{$i}.foto")) {
                $fotoPath = $request->file("instruktur.{$i}.foto")
                    ->store("landing/{$bootcamp->id}/instruktur", 'public');
            }

            $bootcamp->instruktur()->create([
                'nama'     => $data['nama'],
                'jabatan'  => $data['jabatan'] ?? null,
                'bio'      => $data['bio'] ?? null,
                'foto'     => $fotoPath,
                'urutan'   => $i + 1,
            ]);
        }

        return back();
    }

    // ─────────────────────────────────────────────
    // SILABUS
    // ─────────────────────────────────────────────
    public function silabus(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'silabus'   => 'required|array|min:1',
            'silabus.*' => 'required|string|max:500',
        ]);

        // Simpan sebagai JSON di kolom bootcamp atau tabel terpisah
        $bootcamp->landingContents()->updateOrCreate(
            ['section' => 'silabus'],
            ['konten'  => json_encode(array_values($request->silabus))]
        );

        return back();
    }

    // ─────────────────────────────────────────────
    // COCOK UNTUK
    // ─────────────────────────────────────────────
    public function cocokUntuk(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'items'   => 'required|array|min:1',
            'items.*' => 'required|string|max:500',
        ]);

        $bootcamp->landingContents()->updateOrCreate(
            ['section' => 'cocok_untuk'],
            ['konten'  => json_encode(array_values($request->items))]
        );

        return back();
    }

    // ─────────────────────────────────────────────
    // OUTCOME
    // ─────────────────────────────────────────────
    public function outcome(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'items'   => 'required|array|min:1',
            'items.*' => 'required|string|max:500',
        ]);

        $bootcamp->landingContents()->updateOrCreate(
            ['section' => 'outcome'],
            ['konten'  => json_encode(array_values($request->items))]
        );

        return back();
    }

    // ─────────────────────────────────────────────
    // FAQ
    // ─────────────────────────────────────────────
    public function faq(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'faqs'                => 'required|array|min:1',
            'faqs.*.pertanyaan'   => 'required|string|max:500',
            'faqs.*.jawaban'      => 'required|string',
        ]);

        $bootcamp->landingContents()->updateOrCreate(
            ['section' => 'faq'],
            ['konten'  => json_encode(array_values($request->faqs))]
        );

        return back();
    }

    // ─────────────────────────────────────────────
    // TESTIMONI
    // ─────────────────────────────────────────────
    public function testimoni(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'testimoni'            => 'required|array|min:1',
            'testimoni.*.nama'     => 'required|string|max:255',
            'testimoni.*.profesi'  => 'nullable|string|max:255',
            'testimoni.*.isi'      => 'required|string',
            'testimoni.*.rating'   => 'required|integer|min:1|max:5',
        ]);

        // Hapus testimoni lama
        $bootcamp->testimoni()->delete();

        foreach ($request->testimoni as $i => $data) {
            $bootcamp->testimoni()->create([
                'nama'    => $data['nama'],
                'profesi' => $data['profesi'] ?? null,
                'isi'     => $data['isi'],
                'rating'  => $data['rating'],
                'urutan'  => $i + 1,
            ]);
        }

        return back();
    }
}