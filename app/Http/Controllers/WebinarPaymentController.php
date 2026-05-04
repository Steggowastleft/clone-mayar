<?php

namespace App\Http\Controllers;

use App\Models\Webinar;
use App\Models\PaymentLink;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WebinarPaymentController extends Controller
{
    /**
     * Menampilkan halaman checkout webinar
     */
    public function checkout(Webinar $webinar)
    {
        if ($webinar->status !== 'published') {
            return abort(404);
        }

        if ($webinar->isFull()) {
            return abort(403, 'Webinar sudah penuh');
        }

        if (!$webinar->isRegistrationOpen()) {
            return abort(403, 'Pendaftaran webinar sudah ditutup');
        }

        $webinarData = [
            'id'            => $webinar->id,
            'nama'          => $webinar->nama,
            'harga'         => $webinar->harga,
            'harga_coret'   => $webinar->harga_coret,
            'is_free'       => $webinar->harga == 0,
            'cover'         => $webinar->cover ? asset('storage/' . $webinar->cover) : null,
            'tanggal_mulai' => $webinar->tanggal_mulai,
        ];

        return Inertia::render('webinar/checkout', [
            'webinar' => $webinarData
        ]);
    }

    /**
     * Proses pembayaran via Midtrans
     */
    public function processPayment(Request $request, Webinar $webinar)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
        ]);

        // Cek apakah webinar masih valid untuk didaftar
        if ($webinar->status !== 'published' || $webinar->isFull()) {
            return response()->json([
                'success' => false,
                'message' => 'Webinar tidak tersedia untuk pendaftaran'
            ], 403);
        }

        // Jika gratis, langsung daftar
        if ($webinar->harga == 0) {
            $peserta = $webinar->peserta + 1;
            $webinar->update(['peserta' => $peserta]);

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mendaftar webinar gratis',
                'order_id' => 'FREE-' . Str::random(12),
            ]);
        }

        // Generate order ID
        $orderId = 'WBN-' . $webinar->id . '-' . time();

        // Siapkan data untuk Midtrans
        $midtransConfig = [
            'server_key' => env('MIDTRANS_SERVER_KEY'),
            'client_key' => env('MIDTRANS_CLIENT_KEY'),
        ];

        \Midtrans\Config::$serverKey = $midtransConfig['server_key'];
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        $params = [
            'transaction_details' => [
                'order_id'      => $orderId,
                'gross_amount'  => (int) $webinar->harga,
            ],
            'customer_details' => [
                'first_name'    => $validated['name'],
                'email'         => $validated['email'],
                'phone'         => $validated['phone'],
            ],
            'item_details' => [
                [
                    'id'       => 'WEBINAR-' . $webinar->id,
                    'price'    => (int) $webinar->harga,
                    'quantity' => 1,
                    'name'     => $webinar->nama,
                ]
            ]
        ];

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);

            // Simpan data pembayaran ke database
            $payment = PaymentLink::create([
                'order_id'      => $orderId,
                'user_email'    => $validated['email'],
                'user_name'     => $validated['name'],
                'user_phone'    => $validated['phone'],
                'amount'        => $webinar->harga,
                'status'        => 'pending',
                'type'          => 'webinar',
                'reference_id'  => $webinar->id,
                'snap_token'    => $snapToken,
            ]);

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
                'order_id'  => $orderId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Callback dari Midtrans
     */
    public function notification(Request $request)
    {
        $payload = $request->all();
        
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);

        try {
            $transaction = \Midtrans\Transaction::status($payload['order_id']);
            $transactionStatus = $transaction->transaction_status;

            $payment = PaymentLink::where('order_id', $payload['order_id'])->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            if ($transactionStatus === 'capture' || $transactionStatus === 'settlement') {
                $payment->update(['status' => 'paid']);

                // Update jumlah peserta webinar
                $webinar = Webinar::find($payment->reference_id);
                if ($webinar) {
                    $webinar->increment('peserta');
                }
            } elseif ($transactionStatus === 'deny' || $transactionStatus === 'expire') {
                $payment->update(['status' => 'failed']);
            } elseif ($transactionStatus === 'cancel') {
                $payment->update(['status' => 'cancelled']);
            }

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Validasi pembayaran
     */
    public function validate(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
        ]);

        $payment = PaymentLink::where('order_id', $request->order_id)->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'payment' => [
                'order_id' => $payment->order_id,
                'status'   => $payment->status,
                'amount'   => $payment->amount,
            ]
        ]);
    }
}
