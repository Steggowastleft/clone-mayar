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
            'instruktur'              => 'nullable|array',
            'instruktur.*.nama'       => 'required_with:instruktur|string|max:255',
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

        if ($request->has('instruktur') && is_array($request->instruktur)) {
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
        }

        return back();
    }

    // ─────────────────────────────────────────────
    // SILABUS
    // ─────────────────────────────────────────────
    public function silabus(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'silabus'   => 'nullable|array',
            'silabus.*' => 'required_with:silabus|string|max:500',
        ]);

        if ($request->has('silabus') && is_array($request->silabus)) {
            $bootcamp->landingContents()->updateOrCreate(
                ['section' => 'silabus'],
                ['konten'  => json_encode(array_values($request->silabus))]
            );
        } else {
            $bootcamp->landingContents()->where('section', 'silabus')->delete();
        }

        return back();
    }

    // ─────────────────────────────────────────────
    // COCOK UNTUK
    // ─────────────────────────────────────────────
    public function cocokUntuk(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'items'   => 'nullable|array',
            'items.*' => 'required_with:items|string|max:500',
        ]);

        if ($request->has('items') && is_array($request->items)) {
            $bootcamp->landingContents()->updateOrCreate(
                ['section' => 'cocok_untuk'],
                ['konten'  => json_encode(array_values($request->items))]
            );
        } else {
            $bootcamp->landingContents()->where('section', 'cocok_untuk')->delete();
        }

        return back();
    }

    // ─────────────────────────────────────────────
    // OUTCOME
    // ─────────────────────────────────────────────
    public function outcome(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'items'   => 'nullable|array',
            'items.*' => 'required_with:items|string|max:500',
        ]);

        if ($request->has('items') && is_array($request->items)) {
            $bootcamp->landingContents()->updateOrCreate(
                ['section' => 'outcome'],
                ['konten'  => json_encode(array_values($request->items))]
            );
        } else {
            $bootcamp->landingContents()->where('section', 'outcome')->delete();
        }

        return back();
    }

    // ─────────────────────────────────────────────
    // FAQ
    // ─────────────────────────────────────────────
    public function faq(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'faqs'                => 'nullable|array',
            'faqs.*.pertanyaan'   => 'required_with:faqs|string|max:500',
            'faqs.*.jawaban'      => 'required_with:faqs|string',
        ]);

        if ($request->has('faqs') && is_array($request->faqs)) {
            $bootcamp->landingContents()->updateOrCreate(
                ['section' => 'faq'],
                ['konten'  => json_encode(array_values($request->faqs))]
            );
        } else {
            $bootcamp->landingContents()->where('section', 'faq')->delete();
        }

        return back();
    }

    // ─────────────────────────────────────────────
    // TESTIMONI
    // ─────────────────────────────────────────────
    public function testimoni(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'testimoni'            => 'nullable|array',
            'testimoni.*.nama'     => 'required_with:testimoni|string|max:255',
            'testimoni.*.profesi'  => 'nullable|string|max:255',
            'testimoni.*.isi'      => 'required_with:testimoni|string',
            'testimoni.*.rating'   => 'required_with:testimoni|integer|min:1|max:5',
        ]);

        // Hapus testimoni lama
        $bootcamp->testimoni()->delete();

        if ($request->has('testimoni') && is_array($request->testimoni)) {
            foreach ($request->testimoni as $i => $data) {
                $bootcamp->testimoni()->create([
                    'nama'    => $data['nama'],
                    'profesi' => $data['profesi'] ?? null,
                    'isi'     => $data['isi'],
                    'rating'  => $data['rating'],
                    'urutan'  => $i + 1,
                ]);
            }
        }

        return back();
    }
}