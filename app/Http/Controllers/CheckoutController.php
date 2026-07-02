<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Pendaftaran;
use App\Models\KelasOnlinePeserta;
use App\Models\Bootcamp;
use App\Models\Webinar;
use App\Models\Event;
use App\Models\KelasOnline;
use App\Models\Ebook;
use App\Models\Produkdigital;
use App\Models\DigitalProduct;
use App\Models\CoachingMentoring;
use App\Models\Tulisan;
use App\Models\Bundling;
use App\Models\Pembayaran;
use App\Models\PaymentLink;
use App\Models\PenggalanganDana;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    /**
     * Set up Midtrans configuration
     */
    protected function initMidtrans()
    {
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$clientKey = env('MIDTRANS_CLIENT_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;
    }

    /**
     * Process checkout registration (Free direct claim / Paid Midtrans SNAP token)
     */
    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'product_type' => 'required|string',
            'product_id'   => 'required',
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|max:255',
            'phone'        => 'required|string|max:20',
            'amount'       => 'nullable|numeric|min:1000',
            'coupon_code'  => 'nullable|string',
        ]);

        $peserta = Auth::guard('peserta')->user();
        if (!$peserta) {
            return response()->json([
                'message' => 'Silakan login terlebih dahulu untuk melakukan pendaftaran.'
            ], 401);
        }

        // Map product type to Model Class
        $typeMapping = [
            'bootcamp'           => Bootcamp::class,
            'webinar'            => Webinar::class,
            'event'              => Event::class,
            'kelas-online'       => KelasOnline::class,
            'ebook'              => Ebook::class,
            'produk-digital'     => DigitalProduct::class,
            'coaching-mentoring' => CoachingMentoring::class,
            'tulisan'            => Tulisan::class,
            'bundling'           => Bundling::class,
            'payment-link'       => PaymentLink::class,
            'penggalangan-dana'  => PenggalanganDana::class,
        ];

        $productType = strtolower($validated['product_type']);
        if (!array_key_exists($productType, $typeMapping)) {
            return response()->json(['message' => 'Tipe produk tidak valid.'], 400);
        }

        $modelClass = $typeMapping[$productType];
        $product = $modelClass::findOrFail($validated['product_id']);

        // Extract name and price based on model structure
        $productName = '';
        $price = 0;

        if ($productType === 'bootcamp') {
            $productName = $product->name;
            $price = (float) $product->harga;
        } elseif ($productType === 'penggalangan-dana') {
            $productName = $product->nama;
            $price = $request->has('amount') ? (float) $request->input('amount') : (float) ($product->minimal_donasi ?: 1000);
        } else {
            $productName = $product->nama;
            $price = (float) $product->harga;
        }

        $appliedCouponCode = null;
        if ($request->filled('coupon_code') && $productType !== 'penggalangan-dana') {
            $kode = strtoupper($request->input('coupon_code'));
            $diskon = \App\Models\Diskon::whereRaw('UPPER(kode_kupon) = ?', [$kode])->first();
            if ($diskon && ($diskon->status === 'aktif' || $diskon->is_aktif)) {
                $applies = true;
                if ($diskon->untuk_produk === 'pilih') {
                    $productIds = $diskon->produk_ids ?? [];
                    if (!is_array($productIds)) {
                        $productIds = json_decode($productIds, true) ?? [];
                    }
                    $normalizedProductId = strtolower($productType . ':' . $product->id);
                    $normalizedProductIds = array_map('strtolower', $productIds);
                    $applies = in_array($normalizedProductId, $normalizedProductIds);
                }
                
                if ($applies) {
                    $besaran = floatval($diskon->besaran);
                    $discountAmount = 0;
                    if ($diskon->tipe_diskon === 'persentase') {
                        $discountAmount = ($besaran / 100) * $price;
                    } else {
                        $discountAmount = $besaran;
                    }
                    if ($discountAmount > $price) {
                        $discountAmount = $price;
                    }
                    $price -= $discountAmount;
                    $diskon->increment('jumlah_dipakai');
                    $appliedCouponCode = $kode;
                }
            }
        }

        // Check if already registered
        if ($productType === 'kelas-online') {
            $existing = KelasOnlinePeserta::where('kelas_online_id', $product->id)
                ->where('peserta_id', $peserta->id)
                ->first();
        } else {
            $existing = Pendaftaran::where('registrable_id', $product->id)
                ->where('registrable_type', $modelClass)
                ->where('peserta_id', $peserta->id)
                ->first();
        }

        if ($existing && in_array($existing->status, ['aktif', 'active', 'completed'])) {
            if ($productType !== 'payment-link' && $productType !== 'penggalangan-dana') {
                return response()->json([
                    'message'  => 'Anda sudah terdaftar/membeli produk ini.',
                    'redirect' => '/peserta/dashboard'
                ], 409);
            }
        }

        // Case 1: FREE product - direct activation
        if ($price <= 0) {
            if ($productType === 'kelas-online') {
                KelasOnlinePeserta::updateOrCreate(
                    [
                        'kelas_online_id' => $product->id,
                        'peserta_id'      => $peserta->id,
                    ],
                    [
                        'status'          => 'aktif',
                        'mendaftar_pada'  => now(),
                        'coupon_code'     => $appliedCouponCode,
                    ]
                );
            } else {
                Pendaftaran::updateOrCreate(
                    [
                        'registrable_id'   => $product->id,
                        'registrable_type' => $modelClass,
                        'peserta_id'       => $peserta->id,
                    ],
                    [
                        'status'           => 'active',
                        'harga_bayar'      => 0,
                        'tanggal_daftar'   => now(),
                        'tanggal_aktif'    => now(),
                        'coupon_code'      => $appliedCouponCode,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'is_free' => true,
                'redirect' => '/peserta/dashboard',
                'message'  => 'Pendaftaran berhasil!'
            ]);
        }

        // Case 2: PAID product - Midtrans Snap Token Request
        $prefixMapping = [
            'bootcamp'           => 'BC',
            'webinar'            => 'WBN',
            'event'              => 'EV',
            'kelas-online'       => 'KO',
            'ebook'              => 'EB',
            'produk-digital'     => 'PD',
            'coaching-mentoring' => 'CM',
            'tulisan'            => 'TL',
            'bundling'           => 'BD',
            'payment-link'       => 'PL',
            'penggalangan-dana'  => 'GD',
        ];

        $finalPrice = $price;
        $itemDetails = [
            [
                'id'       => $productType . '-' . $product->id,
                'price'    => (int) $price,
                'quantity' => 1,
                'name'     => substr($productName, 0, 50),
            ]
        ];

        if ($price > 0) {
            $finalPrice = $price + 5000;
            $itemDetails[] = [
                'id'       => 'admin-fee',
                'price'    => 5000,
                'quantity' => 1,
                'name'     => 'Biaya Penanganan Admin',
            ];
        }

        $prefix = $prefixMapping[$productType];
        $orderId = $prefix . '-' . $product->id . '-' . time() . '-' . strtoupper(Str::random(4));

        $this->initMidtrans();

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $finalPrice,
            ],
            'customer_details' => [
                'first_name' => $validated['name'],
                'email'      => $validated['email'],
                'phone'      => $validated['phone'],
            ],
            'item_details' => $itemDetails
        ];

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);

            // Record pending state in database
            if ($productType === 'kelas-online') {
                KelasOnlinePeserta::updateOrCreate(
                    [
                        'kelas_online_id' => $product->id,
                        'peserta_id'      => $peserta->id,
                    ],
                    [
                        'status'          => 'pending',
                        'mendaftar_pada'  => now(),
                        'order_id'        => $orderId,
                        'snap_token'      => $snapToken,
                        'coupon_code'     => $appliedCouponCode,
                    ]
                );
            } else {
                Pendaftaran::updateOrCreate(
                    [
                        'registrable_id'   => $product->id,
                        'registrable_type' => $modelClass,
                        'peserta_id'       => $peserta->id,
                    ],
                    [
                        'status'           => 'pending',
                        'harga_bayar'      => $finalPrice,
                        'tanggal_daftar'   => now(),
                        'order_id'         => $orderId,
                        'snap_token'       => $snapToken,
                        'coupon_code'      => $appliedCouponCode,
                    ]
                );
            }

            // Record pending Pembayaran state so it shows up in seller balance/reports
            Pembayaran::updateOrCreate(
                ['order_id' => $orderId],
                [
                    'bootcamp_id'    => $productType === 'bootcamp' ? $product->id : null,
                    'peserta_id'     => $peserta->id,
                    'nama_pembeli'   => $validated['name'],
                    'email_pembeli'  => $validated['email'],
                    'no_hp_pembeli'  => $validated['phone'],
                    'jumlah'         => $finalPrice,
                    'status'         => 'pending',
                    'coupon_code'    => $appliedCouponCode,
                ]
            );

            return response()->json([
                'success'    => true,
                'is_free'    => false,
                'snap_token' => $snapToken,
                'order_id'   => $orderId,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook Notification from Midtrans
     */
    public function notification(Request $request)
    {
        $payload = $request->all();
        
        $this->initMidtrans();

        try {
            $orderId = $payload['order_id'];
            $transaction = \Midtrans\Transaction::status($orderId);
            $transactionStatus = $transaction->transaction_status;

            // Search in KelasOnlinePeserta
            $kelasEnroll = KelasOnlinePeserta::where('order_id', $orderId)->first();
            
            // Search in Pendaftaran
            $pendaftaran = Pendaftaran::where('order_id', $orderId)->first();

            if (!$kelasEnroll && !$pendaftaran) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            $isPaid = ($transactionStatus === 'capture' || $transactionStatus === 'settlement');
            $isFailed = in_array($transactionStatus, ['deny', 'expire', 'cancel']);

            if ($kelasEnroll) {
                if ($isPaid) {
                    $kelasEnroll->update([
                        'status' => 'aktif',
                    ]);
                } elseif ($isFailed) {
                    $kelasEnroll->update([
                        'status' => 'failed',
                    ]);
                }
            }

            if ($pendaftaran) {
                if ($isPaid) {
                    if ($pendaftaran->status !== 'active') {
                        $pendaftaran->update([
                            'status'        => 'active',
                            'tanggal_aktif' => now(),
                        ]);

                        // Sync PenggalanganDana totals if it is a donation
                        if ($pendaftaran->registrable_type === \App\Models\PenggalanganDana::class) {
                            $campaign = $pendaftaran->registrable;
                            if ($campaign) {
                                $donationAmount = (float) $pendaftaran->harga_bayar;
                                if ($donationAmount > 5000) {
                                    $donationAmount -= 5000;
                                }
                                $campaign->increment('terkumpul', $donationAmount);
                                $campaign->increment('pembeli');
                            }
                        }

                        // Sync Webinar totals if it is a webinar
                        if ($pendaftaran->registrable_type === \App\Models\Webinar::class) {
                            $webinar = $pendaftaran->registrable;
                            if ($webinar) {
                                $webinar->increment('peserta');
                            }
                        }
                    }
                } elseif ($isFailed) {
                    $pendaftaran->update([
                        'status' => 'failed',
                    ]);
                }
            }

            // Sync with Pembayaran table to increase Saldo
            $pembayaran = Pembayaran::where('order_id', $orderId)->first();
            if ($pembayaran) {
                if ($isPaid) {
                    $pembayaran->update([
                        'status'       => 'confirmed',
                        'confirmed_at' => now(),
                    ]);
                } elseif ($isFailed) {
                    $pembayaran->update([
                        'status' => 'rejected',
                    ]);
                }
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Validate Order status for Confirmation screen
     */
    public function validatePayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
        ]);

        $orderId = $request->order_id;

        $kelasEnroll = KelasOnlinePeserta::where('order_id', $orderId)->first();
        $pendaftaran = Pendaftaran::where('order_id', $orderId)->first();

        if (!$kelasEnroll && !$pendaftaran) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan'
            ], 404);
        }

        // Auto-check status directly with Midtrans API (essential for local testing/development)
        try {
            $this->initMidtrans();
            $transaction = \Midtrans\Transaction::status($orderId);
            $transactionStatus = $transaction->transaction_status;

            $isPaid = ($transactionStatus === 'capture' || $transactionStatus === 'settlement');
            $isFailed = in_array($transactionStatus, ['deny', 'expire', 'cancel']);

            if ($isPaid) {
                if ($kelasEnroll && $kelasEnroll->status !== 'aktif') {
                    $kelasEnroll->update(['status' => 'aktif']);
                }
                if ($pendaftaran && $pendaftaran->status !== 'active') {
                    $pendaftaran->update(['status' => 'active', 'tanggal_aktif' => now()]);

                    // Sync PenggalanganDana totals if it is a donation
                    if ($pendaftaran->registrable_type === \App\Models\PenggalanganDana::class) {
                        $campaign = $pendaftaran->registrable;
                        if ($campaign) {
                            $donationAmount = (float) $pendaftaran->harga_bayar;
                            if ($donationAmount > 5000) {
                                    $donationAmount -= 5000;
                            }
                            $campaign->increment('terkumpul', $donationAmount);
                            $campaign->increment('pembeli');
                        }
                    }

                    // Sync Webinar totals if it is a webinar
                    if ($pendaftaran->registrable_type === \App\Models\Webinar::class) {
                        $webinar = $pendaftaran->registrable;
                        if ($webinar) {
                            $webinar->increment('peserta');
                        }
                    }
                }

                $pembayaran = Pembayaran::where('order_id', $orderId)->first();
                if ($pembayaran && $pembayaran->status !== 'confirmed') {
                    $pembayaran->update([
                        'status'       => 'confirmed',
                        'confirmed_at' => now(),
                    ]);
                }
            } elseif ($isFailed) {
                if ($kelasEnroll && $kelasEnroll->status !== 'failed') {
                    $kelasEnroll->update(['status' => 'failed']);
                }
                if ($pendaftaran && $pendaftaran->status !== 'failed') {
                    $pendaftaran->update(['status' => 'failed']);
                }

                $pembayaran = Pembayaran::where('order_id', $orderId)->first();
                if ($pembayaran && $pembayaran->status !== 'rejected') {
                    $pembayaran->update(['status' => 'rejected']);
                }
            }
        } catch (\Exception $e) {
            // Ignore API exceptions and fall back to local database status
        }

        // Re-read fresh state from database
        if ($kelasEnroll) {
            $kelasEnroll->refresh();
        }
        if ($pendaftaran) {
            $pendaftaran->refresh();
        }

        $status = $kelasEnroll ? $kelasEnroll->status : $pendaftaran->status;
        $amount = $kelasEnroll ? 0 : $pendaftaran->harga_bayar;

        return response()->json([
            'success' => true,
            'payment' => [
                'order_id' => $orderId,
                'status'   => $status,
                'amount'   => $amount,
            ]
        ]);
    }
}
