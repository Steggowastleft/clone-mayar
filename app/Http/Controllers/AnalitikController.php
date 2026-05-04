<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AnalitikController extends Controller
{
    public function index()
    {
        return Inertia::render('analitik/index', [
            'stats' => [
                'pendapatan_bulan_ini'  => 0,
                'pendapatan_bulan_lalu' => 0,
                'transaksi_bulan_ini'   => 0,
                'transaksi_bulan_lalu'  => 0,
                'pelanggan_baru'        => 0,
                'produk_terlaris'       => [],
                'pendapatan_per_bulan'  => [],
            ],
        ]);
    }
}
