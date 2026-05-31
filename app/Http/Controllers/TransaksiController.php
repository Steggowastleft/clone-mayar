<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TransaksiController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        // Ambil semua transaksi (Pembayaran) milik user
        $pembayarans = $this->queryUserPembayaran($userId)
            ->with(['bootcamp.user'])
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
                'produk'       => $productName,
                'jenis_produk' => $jenisProduk,
                'jumlah'       => (float) $p->jumlah,
                'status'       => $p->status === 'confirmed' ? 'sukses' : ($p->status === 'rejected' ? 'gagal' : 'pending'),
                'tanggal'      => $p->created_at->format('d M Y, H:i'),
                'penjual'      => $penjual,
                'redirect_url' => $redirectUrl,
            ];
        })->values()->toArray();

        return Inertia::render('transaksi/index', [
            'transaksi' => $transaksi,
        ]);
    }

    public function show($id)
    {
        $userId = auth()->id();
        $p = \App\Models\Pembayaran::with(['bootcamp.user'])->findOrFail($id);

        // Security check
        $hasAccess = false;
        if ($p->bootcamp_id && $p->bootcamp && $p->bootcamp->user_id == $userId) {
            $hasAccess = true;
        } else {
            // Find in Pendaftaran or KelasOnlinePeserta
            $kelasEnroll = \App\Models\KelasOnlinePeserta::where('order_id', $p->order_id)->first();
            if ($kelasEnroll) {
                $class = \App\Models\KelasOnline::find($kelasEnroll->kelas_online_id);
                if ($class && $class->user_id == $userId) {
                    $hasAccess = true;
                }
            } else {
                $pendaftaran = \App\Models\Pendaftaran::where('order_id', $p->order_id)->first();
                if ($pendaftaran && $pendaftaran->registrable) {
                    if ($pendaftaran->registrable->user_id == $userId) {
                        $hasAccess = true;
                    }
                }
            }
        }

        if (!$hasAccess) {
            abort(403, 'Unauthorized action.');
        }

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

        $productName = '-';
        $jenisProduk = 'Produk';
        $penjual = 'Admin';
        $redirectUrl = '#';
        $originalPrice = (float) $p->jumlah;
        $discountAmount = 0.0;
        $netTotal = (float) $p->jumlah;

        if ($p->bootcamp_id && $p->bootcamp) {
            $productName = $p->bootcamp->name;
            $jenisProduk = 'Bootcamp';
            $penjual = $p->bootcamp->user?->name ?? 'Admin';
            $redirectUrl = '/bootcamps/' . $p->bootcamp_id;
            $originalPrice = (float) ($p->bootcamp->harga ?? $p->jumlah);
            $discountAmount = max(0.0, $originalPrice - $netTotal);
        } else {
            // Parse order_id
            $orderId = $p->order_id;
            $parts = explode('-', $orderId);
            $prefix = $parts[0] ?? '';
            $productId = $parts[1] ?? '';

            if (isset($prefixToModel[$prefix]) && !empty($productId)) {
                [$modelClass, $typeLabel] = $prefixToModel[$prefix];
                $jenisProduk = $typeLabel;

                try {
                    $product = $modelClass::find($productId);
                    if ($product) {
                        $productName = $product->nama ?? $product->name ?? $product->title ?? '-';
                        $penjual = $product->user?->name ?? 'Admin';
                        $originalPrice = (float) ($product->harga ?? $p->jumlah);
                        $discountAmount = max(0.0, $originalPrice - $netTotal);
                        
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
                    // ignore
                }
            }
        }

        $detail = [
            'id'             => $p->id,
            'order_id'       => $p->order_id ?? '-',
            'nama_pembeli'   => $p->nama_pembeli ?? '-',
            'email_pembeli'  => $p->email_pembeli ?? '-',
            'no_hp_pembeli'  => $p->no_hp_pembeli ?? '-',
            'status'         => $p->status === 'confirmed' ? 'sukses' : ($p->status === 'rejected' ? 'gagal' : 'pending'),
            'tanggal'        => $p->created_at->format('d-m-Y H:i:s'),
            
            // Product Info
            'produk_nama'    => $productName,
            'produk_jenis'   => $jenisProduk,
            'penjual'        => $penjual,
            'redirect_url'   => $redirectUrl,

            // Payment Breakdown
            'harga_original' => $originalPrice,
            'diskon'         => $discountAmount,
            'total_bayar'    => $netTotal,
            'catatan'        => $p->catatan ?? '',
        ];

        return Inertia::render('transaksi/detail', [
            'detail' => $detail,
        ]);
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
