<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PelangganController extends Controller
{
    public function index()
    {
        return Inertia::render('pelanggan/index', [
            'pelanggan' => [],
        ]);
    }
}
