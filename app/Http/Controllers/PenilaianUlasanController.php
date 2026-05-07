<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Rating;

class PenilaianUlasanController extends Controller
{
    public function index(): Response
    {
        $userId = auth()->id();

        // 1. Ambil semua produk milik user ini
        $products = $this->getAllProducts($userId);

        // 2. Ambil semua rating yang terhubung ke produk-produk tersebut
        // Karena rating sekarang polimorfik, kita perlu memetakan rateable_id dan rateable_type
        $ratings = Rating::with(['peserta', 'rateable'])
            ->where(function($query) use ($products) {
                foreach ($products as $p) {
                    $query->orWhere(function($q) use ($p) {
                        $q->where('rateable_id', $p['product_id'])
                          ->where('rateable_type', $this->getMorphModel($p['type']));
                    });
                }
            })
            ->latest()
            ->get();

        // 3. Map ratings untuk frontend
        $mappedRatings = $ratings->map(function ($r) {
            $pesertaNama = $r->peserta?->nama ?? 'Peserta';
            if ($r->tampil_anonim) {
                $pesertaNama = 'Anonim';
            }

            return [
                'id'            => $r->id,
                'rateable_id'   => $r->rateable_id,
                'rateable_type' => $r->rateable_type,
                'product_nama'  => $r->rateable?->nama ?? $r->rateable?->name ?? 'Produk',
                'bintang'       => $r->bintang,
                'ulasan'        => $r->ulasan,
                'tampil_anonim' => $r->tampil_anonim,
                'foto_url'      => $r->foto_url,
                'nama_peserta'  => $pesertaNama,
                'created_at'    => $r->created_at->toISOString(),
            ];
        });

        return Inertia::render('penilaian-dan-ulasan/index', [
            'products' => $products,
            'ratings'  => $mappedRatings,
        ]);
    }

    /**
     * Helper to get all products owned by the user
     */
    private function getAllProducts($userId)
    {
        $products = [];

        // Bootcamp
        $bootcamps = \App\Models\Bootcamp::where('user_id', $userId)->get(['id', 'name']);
        foreach($bootcamps as $b) {
            $products[] = ['id' => "bootcamp:{$b->id}", 'product_id' => $b->id, 'type' => 'bootcamp', 'nama' => $b->name];
        }

        // Kelas Online
        $kelasOnline = \App\Models\KelasOnline::where('user_id', $userId)->get(['id', 'nama']);
        foreach($kelasOnline as $k) {
            $products[] = ['id' => "kelas-online:{$k->id}", 'product_id' => $k->id, 'type' => 'kelas-online', 'nama' => $k->nama];
        }

        // Webinar
        $webinars = \App\Models\Webinar::where('user_id', $userId)->get(['id', 'nama']);
        foreach($webinars as $w) {
            $products[] = ['id' => "webinar:{$w->id}", 'product_id' => $w->id, 'type' => 'webinar', 'nama' => $w->nama];
        }

        // Event
        $events = \App\Models\Event::where('user_id', $userId)->get(['id', 'nama']);
        foreach($events as $e) {
            $products[] = ['id' => "event:{$e->id}", 'product_id' => $e->id, 'type' => 'event', 'nama' => $e->nama];
        }

        // Produk Digital
        $produkDigital = \App\Models\ProdukDigital::where('user_id', $userId)->get(['id', 'nama']);
        foreach($produkDigital as $p) {
            $products[] = ['id' => "produk-digital:{$p->id}", 'product_id' => $p->id, 'type' => 'produk-digital', 'nama' => $p->nama];
        }

        // Coaching Mentoring
        $coaching = \App\Models\CoachingMentoring::where('user_id', $userId)->get(['id', 'nama']);
        foreach($coaching as $c) {
            $products[] = ['id' => "coaching:{$c->id}", 'product_id' => $c->id, 'type' => 'coaching', 'nama' => $c->nama];
        }

        // Penggalangan Dana
        $dana = \App\Models\PenggalanganDana::where('user_id', $userId)->get(['id', 'nama']);
        foreach($dana as $d) {
            $products[] = ['id' => "donasi:{$d->id}", 'product_id' => $d->id, 'type' => 'donasi', 'nama' => $d->nama];
        }

        // Tulisan
        $tulisan = \App\Models\Tulisan::where('user_id', $userId)->get(['id', 'nama']);
        foreach($tulisan as $t) {
            $products[] = ['id' => "tulisan:{$t->id}", 'product_id' => $t->id, 'type' => 'tulisan', 'nama' => $t->nama];
        }

        return $products;
    }

    /**
     * Map product type to Morph Model
     */
    private function getMorphModel($type)
    {
        return match ($type) {
            'bootcamp'           => \App\Models\Bootcamp::class,
            'kelas-online'       => \App\Models\KelasOnline::class,
            'webinar'            => \App\Models\Webinar::class,
            'event'              => \App\Models\Event::class,
            'produk-digital'     => \App\Models\ProdukDigital::class,
            'coaching'           => \App\Models\CoachingMentoring::class,
            'donasi'             => \App\Models\PenggalanganDana::class,
            'tulisan'            => \App\Models\Tulisan::class,
            default              => null,
        };
    }
}
