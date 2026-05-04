<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Bootcamp;
use App\Models\Pendaftaran;
use App\Models\Peserta;
use Inertia\Inertia;

class PembayaranController extends Controller
{
    /**
     * Peserta upload bukti transfer (publik, tidak perlu login)
     */
    public function uploadBukti(Request $request)
    {
        $request->validate([
            'bootcamp_id'     => 'required|exists:bootcamps,id',
            'bukti_transfer'  => 'required|image|max:5120',
            'catatan'         => 'nullable|string|max:500',
        ]);

        $bootcamp = Bootcamp::findOrFail($request->bootcamp_id);

        // Simpan bukti transfer
        $path = $request->file('bukti_transfer')->store('bukti-transfer', 'public');

        // Buat record pembayaran
        $orderId = 'ORD-' . strtoupper(Str::random(8)) . '-' . date('Ymd');

        $pembayaran = \App\Models\Pembayaran::create([
            'bootcamp_id'    => $bootcamp->id,
            'nama_pembeli'   => $request->input('nama', 'Calon Peserta'),
            'email_pembeli'  => $request->input('email', ''),
            'jumlah'         => $bootcamp->harga,
            'bukti_transfer' => $path,
            'catatan'        => $request->catatan,
            'status'         => 'pending',
            'order_id'       => $orderId,
        ]);

        return response()->json([
            'success'  => true,
            'order_id' => $orderId,
            'message'  => 'Bukti transfer berhasil dikirim.',
        ]);
    }

    /**
     * Admin konfirmasi pembayaran
     */
    public function confirm(Request $request, \App\Models\Pembayaran $pembayaran)
    {
        $pembayaran->update([
            'status'       => 'confirmed',
            'confirmed_at' => now(),
        ]);

        // Jika peserta sudah ada, buat pendaftaran otomatis
        if ($pembayaran->peserta_id) {
            Pendaftaran::firstOrCreate(
                [
                    'bootcamp_id' => $pembayaran->bootcamp_id,
                    'peserta_id'  => $pembayaran->peserta_id,
                ],
                [
                    'status'         => 'active',
                    'harga_bayar'    => $pembayaran->jumlah,
                    'tanggal_daftar' => now(),
                    'tanggal_aktif'  => now(),
                ]
            );
        }

        return back()->with('success', 'Pembayaran dikonfirmasi.');
    }

    /**
     * Admin tolak pembayaran
     */
    public function reject(\App\Models\Pembayaran $pembayaran)
    {
        $pembayaran->update(['status' => 'rejected']);
        return back()->with('success', 'Pembayaran ditolak.');
    }

    /**
     * List pembayaran untuk tab di penjual (per bootcamp)
     */
    public function index(Bootcamp $bootcamp)
    {
        $pembayarans = \App\Models\Pembayaran::where('bootcamp_id', $bootcamp->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($p) => [
                'id'             => $p->id,
                'order_id'       => $p->order_id,
                'nama_pembeli'   => $p->nama_pembeli,
                'email_pembeli'  => $p->email_pembeli,
                'jumlah'         => $p->jumlah,
                'status'         => $p->status,
                'bukti_url'      => $p->bukti_transfer ? Storage::url($p->bukti_transfer) : null,
                'catatan'        => $p->catatan,
                'created_at'     => $p->created_at->format('d M Y, H:i'),
                'confirmed_at'   => $p->confirmed_at?->format('d M Y, H:i'),
            ]);

        return response()->json($pembayarans);
    }
}