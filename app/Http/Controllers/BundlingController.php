<?php

namespace App\Http\Controllers;

use App\Models\Bundling;
use App\Models\BundlingItem;
use App\Models\Bootcamp;
use App\Models\Ebook;
use App\Models\Webinar;
use App\Models\Event;
use App\Models\Produkdigital;
use App\Models\CoachingMentoring;
use App\Models\Tulisan;
use App\Models\KelasOnline;
use App\Models\PaymentLink;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BundlingController extends Controller
{
    public function index()
    {
        $bundlings = Bundling::where('user_id', auth()->id())
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bundling) {
                return [
                    'id' => $bundling->id,
                    'nama' => $bundling->nama,
                    'harga' => $bundling->harga,
                    'status' => $bundling->status,
                    'cover_url' => $bundling->cover_url,
                    'jumlah_produk' => $bundling->items->count(),
                    'jumlah_terjual' => $bundling->jumlah_terjual,
                    'created_at' => $bundling->created_at->toISOString(),
                ];
            });

        $products = $this->getAvailableProducts();

        return Inertia::render('bundlings/index', [
            'bundlings' => $bundlings,
            'products' => $products,
        ]);
    }

    public function create()
    {
        $products = $this->getAvailableProducts();

        return Inertia::render('bundlings/create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'hargaCoret' => 'nullable|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'cover' => 'nullable|image|max:5120',
            'tipePembayaran' => 'nullable|string|in:gratis,berbayar,bayar_semaunya',
            'tanggalKadaluarsa' => 'nullable|date',
            'pesanSetelahBayar' => 'nullable|string',
            'maksimalPembayaran' => 'nullable|integer|min:1',
            'redirectUrl' => 'nullable|url',
            'bisaAffiliate' => 'nullable|boolean',
            'produkIds' => 'required|array|min:1',
            'produkIds.*' => 'required',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('bundling-covers', 'public');
        }

        $bundling = Bundling::create([
            'user_id' => auth()->id(),
            'nama' => $request->nama,
            'harga' => $request->harga,
            'harga_coret' => $request->hargaCoret,
            'deskripsi' => $request->deskripsi,
            'cover' => $coverPath,
            'tipe_pembayaran' => $request->tipePembayaran ?? 'berbayar',
            'tanggal_kadaluarsa' => $request->tanggalKadaluarsa,
            'pesan_setelah_bayar' => $request->pesanSetelahBayar,
            'maksimal_pembayaran' => $request->maksimalPembayaran,
            'redirect_url' => $request->redirectUrl,
            'bisa_affiliate' => $request->bisaAffiliate ?? false,
            'status' => 'unpublished',
        ]);

        // Store bundling items
        foreach ($request->produkIds as $produkId) {
            $this->addBundlingItem($bundling, $produkId);
        }

        return redirect()->route('bundlings.show', $bundling->id);
    }

    public function show(Bundling $bundling)
    {
      

        $bundling->load(['items', 'registrations']);

        $items = $bundling->items->map(function ($item) {
            $product = $item->itemable;
            return [
                'id' => $item->id,
                'nama' => $product->nama ?? $product->name ?? $product->judul ?? '-',
                'tipe' => class_basename($item->itemable_type),
                'harga' => $product->harga ?? 0,
                'cover' => $product->cover_url ?? $product->cover ?? null,
            ];
        });

        return Inertia::render('bundlings/show', [
            'bundling' => [
                'id' => $bundling->id,
                'nama' => $bundling->nama,
                'harga' => $bundling->harga,
                'harga_coret' => $bundling->harga_coret,
                'deskripsi' => $bundling->deskripsi,
                'cover_url' => $bundling->cover_url,
                'tipe_pembayaran' => $bundling->tipe_pembayaran,
                'tanggal_kadaluarsa' => $bundling->tanggal_kadaluarsa?->toISOString(),
                'pesan_setelah_bayar' => $bundling->pesan_setelah_bayar,
                'maksimal_pembayaran' => $bundling->maksimal_pembayaran,
                'redirect_url' => $bundling->redirect_url,
                'bisa_affiliate' => $bundling->bisa_affiliate,
                'status' => $bundling->status,
                'jumlah_terjual' => $bundling->jumlah_terjual,
                'items' => $items,
                'registrasi_count' => $bundling->registrations->count(),
            ],
        ]);
    }

    public function edit(Bundling $bundling)
    {
        

        $bundling->load('items');
        $products = $this->getAvailableProducts();
        $selectedProducts = $bundling->items->map(function ($item) {
            $typeStr = class_basename($item->itemable_type);
            if ($typeStr === 'Produkdigital') {
                $typeStr = 'Produk Digital';
            } elseif ($typeStr === 'CoachingMentoring') {
                $typeStr = 'Coaching / Mentoring';
            } elseif ($typeStr === 'KelasOnline') {
                $typeStr = 'Kelas Online';
            } elseif ($typeStr === 'PaymentLink') {
                $typeStr = 'Link Pembayaran';
            }
            return [
                'id' => $item->itemable_id . '|' . $item->itemable_type,
                'nama' => $item->itemable->nama ?? $item->itemable->name ?? $item->itemable->judul ?? '-',
                'type' => $typeStr,
            ];
        });

        return Inertia::render('bundlings/edit', [
            'bundling' => [
                'id' => $bundling->id,
                'nama' => $bundling->nama,
                'harga' => $bundling->harga,
                'hargaCoret' => $bundling->harga_coret,
                'deskripsi' => $bundling->deskripsi,
                'cover' => $bundling->cover,
                'tipePembayaran' => $bundling->tipe_pembayaran,
                'tanggalKadaluarsa' => $bundling->tanggal_kadaluarsa?->format('Y-m-d'),
                'pesanSetelahBayar' => $bundling->pesan_setelah_bayar,
                'maksimalPembayaran' => $bundling->maksimal_pembayaran,
                'redirectUrl' => $bundling->redirect_url,
                'bisaAffiliate' => $bundling->bisa_affiliate,
                'produkIds' => $selectedProducts,
            ],
            'products' => $products,
        ]);
    }

    public function update(Request $request, Bundling $bundling)
    {
        

        $request->validate([
            'nama' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
            'hargaCoret' => 'nullable|numeric|min:0',
            'deskripsi' => 'nullable|string',
            'cover' => 'nullable|image|max:5120',
            'tipePembayaran' => 'nullable|string|in:gratis,berbayar,bayar_semaunya',
            'tanggalKadaluarsa' => 'nullable|date',
            'pesanSetelahBayar' => 'nullable|string',
            'maksimalPembayaran' => 'nullable|integer|min:1',
            'redirectUrl' => 'nullable|url',
            'bisaAffiliate' => 'nullable|boolean',
            'produkIds' => 'required|array|min:1',
            'produkIds.*' => 'required',
        ]);

        $coverPath = $bundling->cover;
        if ($request->hasFile('cover')) {
            if ($bundling->cover) {
                Storage::disk('public')->delete($bundling->cover);
            }
            $coverPath = $request->file('cover')->store('bundling-covers', 'public');
        }

        $bundling->update([
            'nama' => $request->nama,
            'harga' => $request->harga,
            'harga_coret' => $request->hargaCoret,
            'deskripsi' => $request->deskripsi,
            'cover' => $coverPath,
            'tipe_pembayaran' => $request->tipePembayaran ?? 'berbayar',
            'tanggal_kadaluarsa' => $request->tanggalKadaluarsa,
            'pesan_setelah_bayar' => $request->pesanSetelahBayar,
            'maksimal_pembayaran' => $request->maksimalPembayaran,
            'redirect_url' => $request->redirectUrl,
            'bisa_affiliate' => $request->bisaAffiliate ?? false,
        ]);

        // Update bundling items
        $bundling->items()->delete();
        foreach ($request->produkIds as $produkId) {
            $this->addBundlingItem($bundling, $produkId);
        }

        return redirect()->route('bundlings.show', $bundling->id);
    }

    public function destroy(Bundling $bundling)
    {
      

        if ($bundling->cover) {
            Storage::disk('public')->delete($bundling->cover);
        }

        $bundling->delete();

        return redirect()->route('bundlings.index');
    }

    public function updateStatus(Request $request, Bundling $bundling)
    {

        $bundling->update([
            'status' => $request->status ?? ($bundling->status === 'published' ? 'unpublished' : 'published'),
        ]);

        return response()->json([
            'success' => true,
            'status' => $bundling->status,
        ]);
    }

    public function catalog()
    {
        $bundlings = Bundling::published()
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bundling) {
                return [
                    'id' => $bundling->id,
                    'nama' => $bundling->nama,
                    'harga' => $bundling->harga,
                    'harga_coret' => $bundling->harga_coret,
                    'cover_url' => $bundling->cover_url,
                    'jumlah_produk' => $bundling->items->count(),
                    'jumlah_terjual' => $bundling->jumlah_terjual,
                    'status' => $bundling->status,
                ];
            });

        return Inertia::render('bundlings/catalog', [
            'bundlings' => $bundlings,
        ]);
    }

    public function publicShow(Bundling $bundling)
    {
        if ($bundling->status !== 'published') {
            abort(404);
        }

        $bundling->load('items');

        $items = $bundling->items->map(function ($item) {
            $product = $item->itemable;
            return [
                'id' => $item->id,
                'nama' => $product->nama ?? $product->name ?? $product->judul ?? '-',
                'tipe' => class_basename($item->itemable_type),
                'harga' => $product->harga ?? 0,
                'cover' => $product->cover_url ?? $product->cover ?? null,
                'deskripsi' => $product->deskripsi ?? '',
            ];
        });

        return Inertia::render('bundlings/public', [
            'bundling' => [
                'id' => $bundling->id,
                'nama' => $bundling->nama,
                'harga' => $bundling->harga,
                'harga_coret' => $bundling->harga_coret,
                'deskripsi' => $bundling->deskripsi,
                'cover_url' => $bundling->cover_url,
                'items' => $items,
                'jumlah_terjual' => $bundling->jumlah_terjual,
            ],
        ]);
    }

    private function addBundlingItem(Bundling $bundling, $produkId)
    {
        // Handle if passed as object/array from frontend
        if (is_array($produkId) && isset($produkId['id'])) {
            $produkId = $produkId['id'];
        }

        if (!is_string($produkId) || !str_contains($produkId, '|')) {
            return;
        }

        [$id, $type] = explode('|', $produkId);

        $modelClass = $this->getModelClass($type);
        if (!$modelClass) {
            return;
        }

        $product = $modelClass::find($id);
        if (!$product) {
            return;
        }

        BundlingItem::create([
            'bundling_id' => $bundling->id,
            'itemable_id' => $product->id,
            'itemable_type' => $modelClass,
        ]);
    }

    private function getAvailableProducts()
    {
        $userId = auth()->id();
        $products = [];

        // Get Bootcamps
        $bootcamps = Bootcamp::where('user_id', $userId)
            ->select('id', 'name as nama', 'harga', 'cover')
            ->get()
            ->map(fn($b) => array_merge($b->toArray(), [
                'type' => 'Bootcamp',
                'id_type' => $b->id . '|' . Bootcamp::class,
            ]));

        // Get Ebooks
        $ebooks = Ebook::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'cover')
            ->get()
            ->map(fn($e) => array_merge($e->toArray(), [
                'type' => 'Ebook',
                'id_type' => $e->id . '|' . Ebook::class,
            ]));

        // Get Webinars
        $webinars = Webinar::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'cover')
            ->get()
            ->map(fn($w) => array_merge($w->toArray(), [
                'type' => 'Webinar',
                'id_type' => $w->id . '|' . Webinar::class,
            ]));

        // Get Events
        $events = Event::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'cover')
            ->get()
            ->map(fn($e) => array_merge($e->toArray(), [
                'type' => 'Event',
                'id_type' => $e->id . '|' . Event::class,
            ]));

        // Get Produk Digital
        $produksDigital = Produkdigital::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'cover')
            ->get()
            ->map(fn($p) => array_merge($p->toArray(), [
                'type' => 'Produk Digital',
                'id_type' => $p->id . '|' . Produkdigital::class,
            ]));

        // Get Coaching / Mentoring
        $coachings = CoachingMentoring::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'cover')
            ->get()
            ->map(fn($c) => array_merge($c->toArray(), [
                'type' => 'Coaching / Mentoring',
                'id_type' => $c->id . '|' . CoachingMentoring::class,
            ]));

        // Get Tulisan
        $tulisans = Tulisan::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'cover')
            ->get()
            ->map(fn($t) => array_merge($t->toArray(), [
                'type' => 'Tulisan',
                'id_type' => $t->id . '|' . Tulisan::class,
            ]));

        // Get Kelas Online
        $kelasOnlines = KelasOnline::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'thumbnail as cover')
            ->get()
            ->map(fn($k) => array_merge($k->toArray(), [
                'type' => 'Kelas Online',
                'id_type' => $k->id . '|' . KelasOnline::class,
            ]));

        // Get Link Pembayaran
        $paymentLinks = PaymentLink::where('user_id', $userId)
            ->select('id', 'nama', 'harga', 'cover')
            ->get()
            ->map(fn($l) => array_merge($l->toArray(), [
                'type' => 'Link Pembayaran',
                'id_type' => $l->id . '|' . PaymentLink::class,
            ]));

        return collect()
            ->concat($bootcamps)
            ->concat($ebooks)
            ->concat($webinars)
            ->concat($events)
            ->concat($produksDigital)
            ->concat($coachings)
            ->concat($tulisans)
            ->concat($kelasOnlines)
            ->concat($paymentLinks)
            ->sortBy('nama')
            ->values();
    }

    private function getModelClass(string $type): ?string
    {
        // If it's already a full class name
        if (str_contains($type, 'App\\Models\\')) {
            return $type;
        }

        $models = [
            'Bootcamp' => Bootcamp::class,
            'Ebook' => Ebook::class,
            'Webinar' => Webinar::class,
            'Event' => Event::class,
            'Produkdigital' => Produkdigital::class,
            'CoachingMentoring' => CoachingMentoring::class,
            'Tulisan' => Tulisan::class,
            'KelasOnline' => KelasOnline::class,
            'PaymentLink' => PaymentLink::class,
        ];

        return $models[$type] ?? null;
    }
}
