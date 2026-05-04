<?php

namespace App\Http\Controllers;

use App\Models\Webinar;
use App\Models\Event;
use App\Models\Produkdigital;
use App\Models\PaymentLink;
use App\Models\Bootcamp;
use App\Models\CoachingMentoring;
use App\Models\PenggalanganDana;
use App\Models\Tulisan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SemuaProdukController extends Controller
{
    /**
     * Aggregates all products from different types
     */
    private function getAllProducts()
    {
        $userId = Auth::id();
        $products = [];

        // Fetch Webinar
        $webinars = Webinar::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($w) => [
                'id' => "webinar:{$w->id}",
                'product_id' => $w->id,
                'type' => 'webinar',
                'nama' => $w->nama,
                'harga' => $w->harga ?? 0,
                'status' => $w->status,
                'tanggal' => $w->created_at->format('d M Y H:i'),
                'terjual' => $w->peserta ?? 0,
                'kategori' => 'Webinar',
            ])->toArray();
        $products = array_merge($products, $webinars);

        // Fetch Event
        $events = Event::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($e) => [
                'id' => "event:{$e->id}",
                'product_id' => $e->id,
                'type' => 'event',
                'nama' => $e->nama,
                'harga' => $e->harga ?? 0,
                'status' => $e->status,
                'tanggal' => $e->created_at->format('d M Y H:i'),
                'terjual' => $e->pendaftaran()->count(),
                'kategori' => 'Event',
            ])->toArray();
        $products = array_merge($products, $events);

        // Fetch Produk Digital
        $produkDigital = Produkdigital::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "produk_digital:{$p->id}",
                'product_id' => $p->id,
                'type' => 'produk-digital',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => $p->total_penjualan ?? 0,
                'kategori' => 'Produk Digital',
            ])->toArray();
        $products = array_merge($products, $produkDigital);

        // Fetch Payment Link
        $paymentLink = PaymentLink::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($l) => [
                'id' => "payment_link:{$l->id}",
                'product_id' => $l->id,
                'type' => 'payment-link',
                'nama' => $l->nama,
                'harga' => $l->harga ?? 0,
                'status' => $l->status,
                'tanggal' => $l->created_at->format('d M Y H:i'),
                'terjual' => 0,
                'kategori' => 'Link Pembayaran',
            ])->toArray();
        $products = array_merge($products, $paymentLink);

        // Fetch Bootcamp
        $bootcamp = Bootcamp::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($b) => [
                'id' => "bootcamp:{$b->id}",
                'product_id' => $b->id,
                'type' => 'bootcamp',
                'nama' => $b->name,
                'harga' => $b->harga ?? 0,
                'status' => $b->status,
                'tanggal' => $b->created_at->format('d M Y H:i'),
                'terjual' => $b->pendaftaran()->count(),
                'kategori' => 'Bootcamp',
            ])->toArray();
        $products = array_merge($products, $bootcamp);

        // Fetch Coaching Mentoring
        $coachings = CoachingMentoring::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => [
                'id' => "coaching_mentoring:{$c->id}",
                'product_id' => $c->id,
                'type' => 'coaching-mentoring',
                'nama' => $c->nama,
                'harga' => $c->harga ?? 0,
                'status' => $c->status,
                'tanggal' => $c->created_at->format('d M Y H:i'),
                'terjual' => $c->total_penjualan ?? 0,
                'kategori' => 'Coaching / Mentoring',
            ])->toArray();
        $products = array_merge($products, $coachings);

        // Fetch Penggalangan Dana
        $penggalanganDana = PenggalanganDana::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "penggalangan_dana:{$p->id}",
                'product_id' => $p->id,
                'type' => 'penggalangan-dana',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => $p->pembeli ?? 0,
                'kategori' => 'Penggalangan Dana',
            ])->toArray();
        $products = array_merge($products, $penggalanganDana);

        // Fetch Tulisan
        $tulisan = Tulisan::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($t) => [
                'id' => "tulisan:{$t->id}",
                'product_id' => $t->id,
                'type' => 'tulisan',
                'nama' => $t->nama,
                'harga' => $t->harga ?? 0,
                'status' => $t->status,
                'tanggal' => $t->created_at->format('d M Y H:i'),
                'terjual' => $t->terjual ?? 0,
                'kategori' => 'Tulisan',
            ])->toArray();
        $products = array_merge($products, $tulisan);

        // Fetch Ebook (Belum Ada Model - Commented out)
        /*
        $ebook = Ebook::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($e) => [
                'id' => "ebook:{$e->id}",
                'product_id' => $e->id,
                'type' => 'ebook',
                'nama' => $e->nama,
                'harga' => $e->harga ?? 0,
                'status' => $e->status,
                'tanggal' => $e->created_at->format('d M Y H:i'),
                'terjual' => 0,
                'kategori' => 'Ebook',
            ])->toArray();
        $products = array_merge($products, $ebook);
        */

        // Fetch Produk Fisik (Belum Ada Model - Commented out)
        /*
        $produkFisik = ProdukFisik::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "produk_fisik:{$p->id}",
                'product_id' => $p->id,
                'type' => 'produk-fisik',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => 0,
                'kategori' => 'Produk Fisik',
            ])->toArray();
        $products = array_merge($products, $produkFisik);
        */

        // Fetch Paket Berlangganan (Belum Ada Model - Commented out)
        /*
        $paketBerlangganan = PaketBerlangganan::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "paket_berlangganan:{$p->id}",
                'product_id' => $p->id,
                'type' => 'paket-berlangganan',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => 0,
                'kategori' => 'Paket Berlangganan',
            ])->toArray();
        $products = array_merge($products, $paketBerlangganan);
        */

        // Sort by created_at descending
        usort($products, function ($a, $b) {
            return strcmp($b['tanggal'], $a['tanggal']);
        });

        return $products;
    }

    /**
     * Display a listing of all products
     */
    public function index(): Response
    {
        $products = $this->getAllProducts();

        return Inertia::render('semua-produk/index', [
            'produk' => $products,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('semua-produk/create', [
            'productTypes' => [
                ['value' => 'kelas-online', 'label' => 'Kelas Online'],
                ['value' => 'webinar', 'label' => 'Webinar'],
                ['value' => 'bootcamp', 'label' => 'Bootcamp'],
                ['value' => 'produk-digital', 'label' => 'Produk Digital'],
                ['value' => 'penggalangan-dana', 'label' => 'Penggalangan Dana'],
                ['value' => 'event', 'label' => 'Event / Acara'],
                ['value' => 'payment-link', 'label' => 'Link Pembayaran'],
                ['value' => 'pembayaran-tagihan', 'label' => 'Pembayaran Tagihan'],
                ['value' => 'faktur-pembayaran', 'label' => 'Faktur Pembayaran'],
            ],
        ]);
    }

    /**
     * Store - redirects to the appropriate product creation page
     */
    public function store(Request $request)
    {
        $type = $request->input('type');

        return match ($type) {
            'webinar' => redirect()->route('webinar.index'),
            'event' => redirect()->route('event.index'),
            'bootcamp' => redirect()->route('bootcamp.index'),
            'coaching-mentoring' => redirect()->route('coaching-mentoring.create'),
            'produk-digital' => redirect()->route('produk-digital.index'),
            'payment-link' => redirect()->route('payment-link.index'),
            'penggalangan-dana' => redirect()->route('penggalangan-dana.index'),
            'tulisan' => redirect()->route('tulisan.index'),
            // 'ebook' => redirect()->route('ebook.index'),
            // 'produk-fisik' => redirect()->route('produk-fisik.index'),
            // 'paket-berlangganan' => redirect()->route('paket-berlangganan.index'),
            default => redirect()->route('semua-produk.index'),
        };
    }

    /**
     * Display the specified product detail
     */
    public function show(string $id): Response
    {
        $parts = explode(':', $id, 2);

        // 🚨 guard clause (WAJIB)
        if (count($parts) < 2) {
            abort(404, 'Invalid product ID');
        }

        [$type, $productId] = $parts;

        $type = str_replace('_', '-', $type);

        $product = match ($type) {
            'webinar' => Webinar::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'event' => Event::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'bootcamp' => Bootcamp::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'coaching-mentoring' => CoachingMentoring::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'produk-digital' => Produkdigital::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'payment-link' => PaymentLink::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'penggalangan-dana' => PenggalanganDana::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'tulisan' => Tulisan::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            default => abort(404),
        };

        return Inertia::render('semua-produk/show', [
            'product' => $product,
            'type' => $type,
        ]);
    }

    /**
     * Show the form for editing the specified resource
     */
    public function edit(string $id): Response
    {
        [$type, $productId] = explode(':', $id, 2);

        // Map underscore types back to hyphen format
        $type = str_replace('_', '-', $type);

        $product = match ($type) {
            'webinar' => Webinar::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'event' => Event::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'bootcamp' => Bootcamp::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'coaching-mentoring' => CoachingMentoring::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'produk-digital' => Produkdigital::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'payment-link' => PaymentLink::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'penggalangan-dana' => PenggalanganDana::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            'tulisan' => Tulisan::where('id', $productId)->where('user_id', Auth::id())->firstOrFail(),
            default => abort(404),
        };

        return Inertia::render('semua-produk/edit', [
            'product' => $product,
            'type' => $type,
        ]);
    }

    /**
     * Update - redirects to the appropriate product edit page
     */
    public function update(Request $request, string $id)
    {
        [$type, $productId] = explode(':', $id, 2);

        // Map underscore types back to hyphen format
        $type = str_replace('_', '-', $type);

        return match ($type) {
            'webinar' => redirect()->route('webinar.index'),
            'event' => redirect()->route('event.index'),
            'bootcamp' => redirect()->route('bootcamp.index'),
            'coaching-mentoring' => redirect()->route('coaching-mentoring.show', $productId),
            'produk-digital' => redirect()->route('produk-digital.index'),
            'payment-link' => redirect()->route('payment-link.index'),
            'penggalangan-dana' => redirect()->route('penggalangan-dana.show', $productId),
            'tulisan' => redirect()->route('tulisan.show', $productId),
            // 'ebook' => redirect()->route('ebook.show', $productId),
            // 'produk-fisik' => redirect()->route('produk-fisik.show', $productId),
            // 'paket-berlangganan' => redirect()->route('paket-berlangganan.show', $productId),
            default => redirect()->route('semua-produk.index'),
        };
    }

    /**
     * Delete - redirects to the appropriate product list
     */
    public function destroy(string $id)
    {
        [$type, $productId] = explode(':', $id, 2);

        // Map underscore types back to hyphen format
        $type = str_replace('_', '-', $type);

        return match ($type) {
            'webinar' => redirect()->route('webinar.index'),
            'event' => redirect()->route('event.index'),
            'bootcamp' => redirect()->route('bootcamp.index'),
            'coaching-mentoring' => redirect()->route('coaching-mentoring.index'),
            'produk-digital' => redirect()->route('produk-digital.index'),
            'payment-link' => redirect()->route('payment-link.index'),
            'penggalangan-dana' => redirect()->route('penggalangan-dana.index'),
            'tulisan' => redirect()->route('tulisan.index'),
            // 'ebook' => redirect()->route('ebook.index'),
            // 'produk-fisik' => redirect()->route('produk-fisik.index'),
            // 'paket-berlangganan' => redirect()->route('paket-berlangganan.index'),
            default => redirect()->route('semua-produk.index'),
        };
    }

    public function catalog(): Response
    {
        $products = $this->getAllProducts();

        // Only show published products in the public catalog
        $publishedProducts = array_filter($products, fn($p) => $p['status'] === 'published');
        $publishedProducts = array_values($publishedProducts);

        return Inertia::render('semua-produk/catalog', [
            'produk' => $publishedProducts,
        ]);
    }
}
