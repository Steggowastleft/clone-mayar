<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class TransaksiController extends Controller
{
    public function index()
    {
        return Inertia::render('transaksi/index', [
            'transaksi' => [],
        ]);
    }
}
