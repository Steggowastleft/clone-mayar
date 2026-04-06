<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class ProdukDigitalController extends Controller
{
    public function index()
    {
        return Inertia::render('produk-digital/index', [
            'produk' => [],
        ]);
    }
}
