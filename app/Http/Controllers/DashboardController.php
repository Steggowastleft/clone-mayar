<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bootcamp;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard/index', [
            'stats' => [
                'total_transaksi'  => 0,
                'total_pendapatan' => 0,
                'total_pelanggan'  => 0,
                'total_produk'     => Bootcamp::count(),
            ],
            'recent_transaksi' => [],
        ]);
    }
}
