<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class PermintaanBayarController extends Controller
{
    public function index(): Response
    {
        $userId = auth()->id();
        // Ambil semua transaksi (Pembayaran) yang berstatus pending milik user
        $pembayarans = $this->queryUserPembayaran($userId)
            ->with(['bootcamp.user'])
            ->where('status', 'pending')
            ->latest()
            ->get();

        $prefixToModel = [
            'BC'  => [\App\Models\Bootcamp::class, 'Bootcamp'],
            'WBN' => [\App\Models\Webinar::class, 'Webinar'],
            'EV'  => [\App\Models\Event::class, 'Event'],
            'KO'  => [\App\Models\KelasOnline::class, 'Kelas Online'],
            'EB'  => [\App\Models\Ebook::class, 'Ebook'],
            'PD'  => [\App\Models\ProdukDigital::class, 'Produk Digital'],
            'CM'  => [\App\Models\CoachingMentoring::class, 'Coaching & Mentoring'],
            'TL'  => [\App\Models\Tulisan::class, 'Tulisan'],
            'BD'  => [\App\Models\Bundling::class, 'Bundling'],
        ];

        $transaksi = $pembayarans->map(function ($p) use ($prefixToModel) {
            $productName = '-';
            $jenisProduk = 'Produk';
            $penjual = 'Admin';
            $redirectUrl = '#';

            if ($p->bootcamp_id && $p->bootcamp) {
                $productName = $p->bootcamp->name;
                $jenisProduk = 'Bootcamp';
                $penjual = $p->bootcamp->user?->name ?? 'Admin';
                $redirectUrl = '/bootcamps/' . $p->bootcamp_id;
            } else {
                // Parse order_id
                $orderId = $p->order_id;
                $parts = explode('-', $orderId);
                $prefix = $parts[0] ?? '';
                $productId = $parts[1] ?? '';

                if (isset($prefixToModel[$prefix]) && !empty($productId)) {
                    [$modelClass, $typeLabel] = $prefixToModel[$prefix];
                    $jenisProduk = $typeLabel;

                    // Query the product model
                    try {
                        $product = $modelClass::find($productId);
                        if ($product) {
                            $productName = $product->nama ?? $product->name ?? $product->title ?? '-';
                            $penjual = $product->user?->name ?? 'Admin';
                            
                            // Determine redirect URL
                            if ($prefix === 'PD') {
                                $redirectUrl = '/produk-digital/' . $productId;
                            } elseif ($prefix === 'KO') {
                                $redirectUrl = '/kelas-online/' . $productId . '/manage';
                            } elseif ($prefix === 'WBN') {
                                $redirectUrl = '/webinars/' . $productId;
                            } elseif ($prefix === 'BC') {
                                $redirectUrl = '/bootcamps/' . $productId;
                            }
                        }
                    } catch (\Exception $e) {
                        // ignore query error
                    }
                }
            }

            return [
                'id'           => $p->id,
                'kode'         => $p->order_id ?? '-',
                'nama_pembeli' => $p->nama_pembeli ?? '-',
                'email'        => $p->email_pembeli ?? '-',
                'no_hp'        => $p->no_hp_pembeli ?? '-',
                'produk'       => $productName,
                'jenis_produk' => $jenisProduk,
                'jumlah'       => (float) $p->jumlah,
                'status'       => 'pending',
                'tanggal'      => $p->created_at->format('d M Y, H:i'),
                'penjual'      => $penjual,
                'redirect_url' => $redirectUrl,
            ];
        })->values()->toArray();

        return Inertia::render('pembayaran-tagihan/index', [
            'transaksi' => $transaksi,
        ]);
    }

    public function sendReminder(Request $request)
    {
        $validated = $request->validate([
            'ids'     => 'required|array',
            'ids.*'   => 'integer',
            'channel' => 'required|in:email,wa,both',
            'method'  => 'required|in:direct,spread',
        ]);

        $ids = $validated['ids'];
        $channel = $validated['channel'];
        $method = $validated['method'];

        $userId = auth()->id();
        $pembayarans = $this->queryUserPembayaran($userId)->whereIn('id', $ids)->get();

        foreach ($pembayarans as $p) {
            // Log simulated reminder
            Log::info("Sending payment reminder to {$p->nama_pembeli} ({$p->email_pembeli} / {$p->no_hp_pembeli}) via {$channel} using {$method} method.");
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengingat berhasil dikirim ke ' . $pembayarans->count() . ' pelanggan.',
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('permintaan-bayar/buat');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'        => 'required|string|max:255',
            'email'       => 'required|email',
            'jumlah'      => 'required|numeric|min:1',
            'keterangan'  => 'nullable|string',
            'kadaluarsa'  => 'nullable|date',
        ]);

        // TODO: simpan ke database

        return redirect()->route('permintaan-bayar.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('permintaan-bayar/show', [
            'id' => $id,
        ]);
    }

    public function destroy(string $id)
    {
        // TODO: hapus dari database

        return redirect()->route('permintaan-bayar.index');
    }

    private function queryUserPembayaran($userId)
    {
        $bootcampIds = \App\Models\Bootcamp::where('user_id', $userId)->pluck('id');
        
        $kelasOrderIds = \App\Models\KelasOnlinePeserta::whereIn(
            'kelas_online_id',
            \App\Models\KelasOnline::where('user_id', $userId)->pluck('id')
        )->pluck('order_id')->filter();

        $pendaftaranOrderIds = \App\Models\Pendaftaran::where(function ($query) use ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Bootcamp::class)
                  ->whereIn('registrable_id', \App\Models\Bootcamp::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Webinar::class)
                  ->whereIn('registrable_id', \App\Models\Webinar::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Event::class)
                  ->whereIn('registrable_id', \App\Models\Event::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Ebook::class)
                  ->whereIn('registrable_id', \App\Models\Ebook::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Produkdigital::class)
                  ->whereIn('registrable_id', \App\Models\Produkdigital::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\CoachingMentoring::class)
                  ->whereIn('registrable_id', \App\Models\CoachingMentoring::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Tulisan::class)
                  ->whereIn('registrable_id', \App\Models\Tulisan::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Bundling::class)
                  ->whereIn('registrable_id', \App\Models\Bundling::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\PaymentLink::class)
                  ->whereIn('registrable_id', \App\Models\PaymentLink::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\PenggalanganDana::class)
                  ->whereIn('registrable_id', \App\Models\PenggalanganDana::where('user_id', $userId)->pluck('id'));
            });
        })->pluck('order_id')->filter();

        $orderIds = $kelasOrderIds->concat($pendaftaranOrderIds)->unique()->toArray();

        return \App\Models\Pembayaran::where(function ($q) use ($bootcampIds, $orderIds) {
            $q->whereIn('bootcamp_id', $bootcampIds);
            if (!empty($orderIds)) {
                $q->orWhereIn('order_id', $orderIds);
            }
        });
    }
}
