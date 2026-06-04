<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Pembayaran;
use App\Models\FakturSetting;
use Illuminate\Support\Facades\Auth;

class FakturController extends Controller
{
    public function index(): Response
    {
        $userId = Auth::id();

        // 1. Ambil list pembayaran pending milik user
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

                    try {
                        $product = $modelClass::find($productId);
                        if ($product) {
                            $productName = $product->nama ?? $product->name ?? $product->title ?? '-';
                            $penjual = $product->user?->name ?? 'Admin';
                            
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

        // 2. Ambil setting faktur user
        $fakturSetting = FakturSetting::where('user_id', $userId)->first();

        // Fallback info user jika setting belum ada
        $user = Auth::user();

        return Inertia::render('faktur/index', [
            'transaksi'     => $transaksi,
            'fakturSetting' => $fakturSetting,
            'userDefault'   => [
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone ?? '',
                'address' => $user->address ?? '',
                'bank_provider' => $user->bank_provider ?? '',
                'bank_account_number' => $user->bank_account_number ?? '',
                'bank_account_name' => $user->bank_account_name ?? '',
            ]
        ]);
    }

    public function saveSettings(Request $request)
    {
        $userId = Auth::id();

        $validated = $request->validate([
            'company_name'    => 'nullable|string|max:255',
            'company_email'   => 'nullable|email|max:255',
            'company_phone'   => 'nullable|string|max:50',
            'company_address' => 'nullable|string',
            'notes'           => 'nullable|string',
            'template_id'     => 'required|string|in:1,2,3',
            'signature_name'  => 'nullable|string|max:255',
            'signature_title' => 'nullable|string|max:255',
        ]);

        FakturSetting::updateOrCreate(
            ['user_id' => $userId],
            $validated
        );

        return redirect()->back()->with('success', 'Pengaturan faktur berhasil disimpan.');
    }

    public function show($id): Response
    {
        $p = Pembayaran::with(['bootcamp.user'])->findOrFail($id);
        $userId = Auth::id();

        // Verifikasi kepemilikan pembayaran (apakah ini milik user)
        // Kita bisa reuse queryUserPembayaran untuk membatasi akses demi keamanan
        $exists = $this->queryUserPembayaran($userId)->where('id', $id)->exists();
        if (!$exists) {
            abort(403, 'Anda tidak memiliki akses ke faktur ini.');
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
        $keterangan = $p->catatan ?? '';

        if ($p->bootcamp_id && $p->bootcamp) {
            $productName = $p->bootcamp->name;
            $jenisProduk = 'Bootcamp';
        } else {
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
                        $keterangan = $product->description ?? $product->catatan ?? '';
                    }
                } catch (\Exception $e) {
                }
            }
        }

        $fakturSetting = FakturSetting::where('user_id', $userId)->first();
        $user = Auth::user();

        $detailFaktur = [
            'id'           => $p->id,
            'kode'         => $p->order_id ?? '-',
            'nama_pembeli' => $p->nama_pembeli ?? '-',
            'email'        => $p->email_pembeli ?? '-',
            'no_hp'        => $p->no_hp_pembeli ?? '-',
            'produk'       => $productName,
            'jenis_produk' => $jenisProduk,
            'jumlah'       => (float) $p->jumlah,
            'status'       => $p->status,
            'tanggal'      => $p->created_at->format('d M Y'),
            'keterangan'   => $keterangan,
        ];

        return Inertia::render('faktur/show', [
            'faktur'        => $detailFaktur,
            'fakturSetting' => $fakturSetting,
            'userDefault'   => [
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone ?? '',
                'address' => $user->address ?? '',
                'bank_provider' => $user->bank_provider ?? '',
                'bank_account_number' => $user->bank_account_number ?? '',
                'bank_account_name' => $user->bank_account_name ?? '',
            ]
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

        return Pembayaran::where(function ($q) use ($bootcampIds, $orderIds) {
            $q->whereIn('bootcamp_id', $bootcampIds);
            if (!empty($orderIds)) {
                $q->orWhereIn('order_id', $orderIds);
            }
        });
    }
}
