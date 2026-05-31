<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Bootcamp;
use App\Models\Pendaftaran;

class RatingController extends Controller
{
    public function store(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'bintang'       => 'required|integer|min:1|max:5',
            'ulasan'        => 'nullable|string|max:1000',
            'tampil_anonim' => 'nullable|boolean',
            'foto'          => 'nullable|image|max:2048',
        ]);

        $peserta = Auth::guard('peserta')->user();

        // Pastikan peserta terdaftar di bootcamp ini
        $terdaftar = Pendaftaran::where('registrable_id', $bootcamp->id)
            ->where('registrable_type', Bootcamp::class)
            ->where('peserta_id', $peserta->id)
            ->exists();

        if (!$terdaftar) {
            return back()->withErrors(['general' => 'Kamu tidak terdaftar di kelas ini.']);
        }

        // Upload foto jika ada
        $fotoUrl = null;
        if ($request->hasFile('foto')) {
            $path    = $request->file('foto')->store('rating-photos', 'public');
            $fotoUrl = Storage::url($path);
        }

        // Upsert — update jika sudah pernah rating
        Rating::updateOrCreate(
            [
                'bootcamp_id' => $bootcamp->id, // keeping for backward compatibility
                'peserta_id'  => $peserta->id,
            ],
            [
                'rateable_id'   => $bootcamp->id,
                'rateable_type' => Bootcamp::class,
                'bintang'       => $request->bintang,
                'ulasan'        => $request->ulasan,
                'tampil_anonim' => $request->boolean('tampil_anonim'),
                'foto_url'      => $fotoUrl ?? Rating::where('bootcamp_id', $bootcamp->id)
                                        ->where('peserta_id', $peserta->id)
                                        ->value('foto_url'),
            ]
        );

        return back()->with('rating_success', true);
    }

    public function destroy(Bootcamp $bootcamp)
    {
        $peserta = Auth::guard('peserta')->user();

        Rating::where('bootcamp_id', $bootcamp->id)
            ->where('peserta_id', $peserta->id)
            ->delete();

        return back()->with('rating_deleted', true);
    }
}