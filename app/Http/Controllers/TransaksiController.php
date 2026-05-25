<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TransaksiController extends Controller
{
    public function index()
    {
        // Ambil semua transaksi Bootcamp (Pembayaran)
        $pembayaran = \App\Models\Pembayaran::with(['bootcamp.user'])
            ->latest()
            ->get()
            ->map(function ($p) {
                return [
                    'id'           => $p->id,
                    'kode'         => $p->order_id ?? '-',
                    'nama_pembeli' => $p->nama_pembeli ?? '-',
                    'email'        => $p->email_pembeli ?? '-',
                    'produk'       => $p->bootcamp ? $p->bootcamp->name : '-',
                    'jenis_produk' => 'Bootcamp',
                    'jumlah'       => (float) $p->jumlah,
                    'status'       => $p->status === 'confirmed' ? 'sukses' : ($p->status === 'rejected' ? 'gagal' : 'pending'),
                    'tanggal'      => $p->created_at->format('d M Y, H:i'),
                    'penjual'      => $p->bootcamp?->user?->name ?? 'Admin',
                ];
            });

        // Ambil semua pendaftaran (selain Bootcamp) yang berbayar
        $pendaftaran = \App\Models\Pendaftaran::with(['registrable.user', 'peserta'])
            ->where('harga_bayar', '>', 0)
            ->whereNotIn('registrable_type', ['App\\Models\\Bootcamp'])
            ->latest()
            ->get()
            ->map(function ($p) {
                $productName = '-';
                $penjual = 'Admin';
                if ($p->registrable) {
                    $productName = $p->registrable->nama
                        ?? $p->registrable->name
                        ?? class_basename($p->registrable_type);
                    $penjual = $p->registrable->user?->name ?? 'Admin';
                }
                
                return [
                    'id'           => 'p_' . $p->id,
                    'kode'         => $p->id ?? '-',
                    'nama_pembeli' => $p->peserta?->nama ?? '-',
                    'email'        => $p->peserta?->email ?? '-',
                    'produk'       => $productName,
                    'jenis_produk' => class_basename($p->registrable_type ?? 'Produk'),
                    'jumlah'       => (float) $p->harga_bayar,
                    'status'       => $p->status === 'aktif' ? 'sukses' : 'pending',
                    'tanggal'      => $p->created_at->format('d M Y, H:i'),
                    'penjual'      => $penjual,
                ];
            });

        $transaksi = $pembayaran->concat($pendaftaran)
            ->sortByDesc(fn($t) => \Carbon\Carbon::parse($t['tanggal']))
            ->values()
            ->toArray();

        return Inertia::render('transaksi/index', [
            'transaksi' => $transaksi,
        ]);
    }
}
