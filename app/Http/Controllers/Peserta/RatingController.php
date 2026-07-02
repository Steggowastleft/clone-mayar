<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\Pendaftaran;

class RatingController extends Controller
{
    public function store(Request $request, $type, $id)
    {
        $request->validate([
            'bintang'       => 'required|integer|min:1|max:5',
            'ulasan'        => 'nullable|string|max:1000',
            'tampil_anonim' => 'nullable|boolean',
            'foto'          => 'nullable|image|max:2048',
        ]);

        $typeMapping = [
            'bootcamp'           => \App\Models\Bootcamp::class,
            'kelas-online'       => \App\Models\KelasOnline::class,
            'ebook'              => \App\Models\Ebook::class,
            'webinar'            => \App\Models\Webinar::class,
            'event'              => \App\Models\Event::class,
            'produk-digital'     => \App\Models\Produkdigital::class,
            'coaching-mentoring' => \App\Models\CoachingMentoring::class,
            'tulisan'            => \App\Models\Tulisan::class,
            'bundling'           => \App\Models\Bundling::class,
        ];

        if (!array_key_exists($type, $typeMapping)) {
            return back()->withErrors(['general' => 'Tipe produk tidak didukung.']);
        }

        $class = $typeMapping[$type];
        $peserta = Auth::guard('peserta')->user();

        // Pastikan peserta memiliki akses / terdaftar di produk ini
        if (!$this->hasProductAccess($peserta->id, $type, $id, $class)) {
            return back()->withErrors(['general' => 'Kamu tidak terdaftar di kelas/produk ini.']);
        }

        // Upload foto jika ada
        $fotoUrl = null;
        if ($request->hasFile('foto')) {
            $path    = $request->file('foto')->store('rating-photos', 'public');
            $fotoUrl = Storage::url($path);
        }

        // Upsert — update jika sudah pernah rating
        $rating = Rating::updateOrCreate(
            [
                'rateable_id'   => $id,
                'rateable_type' => $class,
                'peserta_id'    => $peserta->id,
            ],
            [
                'bootcamp_id'   => $type === 'bootcamp' ? $id : null,
                'bintang'       => $request->bintang,
                'ulasan'        => $request->ulasan,
                'tampil_anonim' => $request->boolean('tampil_anonim'),
                'foto_url'      => $fotoUrl ?? Rating::where('rateable_id', $id)
                                         ->where('rateable_type', $class)
                                         ->where('peserta_id', $peserta->id)
                                         ->value('foto_url'),
            ]
        );

        $mappedRating = [
            'id'            => $rating->id,
            'bintang'       => $rating->bintang,
            'ulasan'        => $rating->ulasan,
            'tampil_anonim' => $rating->tampil_anonim,
            'foto_url'      => $rating->foto_url,
        ];

        return back()->with('rating_success', true)->with('rating', $mappedRating);
    }

    public function destroy($type, $id)
    {
        $typeMapping = [
            'bootcamp'           => \App\Models\Bootcamp::class,
            'kelas-online'       => \App\Models\KelasOnline::class,
            'ebook'              => \App\Models\Ebook::class,
            'webinar'            => \App\Models\Webinar::class,
            'event'              => \App\Models\Event::class,
            'produk-digital'     => \App\Models\Produkdigital::class,
            'coaching-mentoring' => \App\Models\CoachingMentoring::class,
            'tulisan'            => \App\Models\Tulisan::class,
            'bundling'           => \App\Models\Bundling::class,
        ];

        if (!array_key_exists($type, $typeMapping)) {
            return back()->withErrors(['general' => 'Tipe produk tidak didukung.']);
        }

        $class = $typeMapping[$type];
        $peserta = Auth::guard('peserta')->user();

        Rating::where('rateable_id', $id)
            ->where('rateable_type', $class)
            ->where('peserta_id', $peserta->id)
            ->delete();

        // Also clean up legacy field if bootcamp
        if ($type === 'bootcamp') {
            Rating::where('bootcamp_id', $id)
                ->where('peserta_id', $peserta->id)
                ->delete();
        }

        return back()->with('rating_deleted', true);
    }

    private function hasProductAccess($pesertaId, $type, $id, $class)
    {
        if ($type === 'bootcamp') {
            return Pendaftaran::where('registrable_id', $id)
                ->where('registrable_type', \App\Models\Bootcamp::class)
                ->where('peserta_id', $pesertaId)
                ->whereIn('status', ['active', 'aktif', 'completed'])
                ->exists();
        }

        if ($type === 'kelas-online') {
            return \App\Models\KelasOnlinePeserta::where('kelas_online_id', $id)
                ->where('peserta_id', $pesertaId)
                ->whereIn('status', ['aktif', 'active', 'completed'])
                ->exists();
        }

        if ($type === 'bundling') {
            $hasDirect = Pendaftaran::where('peserta_id', $pesertaId)
                ->where('registrable_type', $class)
                ->where('registrable_id', $id)
                ->whereIn('status', ['active', 'aktif', 'completed'])
                ->exists();

            if ($hasDirect) return true;

            return \App\Models\BundlingRegistration::where('peserta_id', $pesertaId)
                ->where('bundling_id', $id)
                ->whereIn('status_pembayaran', ['success', 'paid', 'completed', 'active'])
                ->exists();
        }

        // Other products
        $hasDirect = Pendaftaran::where('peserta_id', $pesertaId)
            ->where('registrable_type', $class)
            ->where('registrable_id', $id)
            ->whereIn('status', ['active', 'aktif', 'completed'])
            ->exists();

        if ($hasDirect) return true;

        // Check if part of purchased bundling
        $bundlingIdsDirect = Pendaftaran::where('peserta_id', $pesertaId)
            ->where('registrable_type', \App\Models\Bundling::class)
            ->whereIn('status', ['active', 'aktif', 'completed'])
            ->pluck('registrable_id');

        $bundlingIdsReg = \App\Models\BundlingRegistration::where('peserta_id', $pesertaId)
            ->whereIn('status_pembayaran', ['success', 'paid', 'completed', 'active'])
            ->pluck('bundling_id');

        $allBundlingIds = $bundlingIdsDirect->concat($bundlingIdsReg)->unique();

        return \App\Models\BundlingItem::whereIn('bundling_id', $allBundlingIds)
            ->where('itemable_type', $class)
            ->where('itemable_id', $id)
            ->exists();
    }
}