<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class LinkPembayaranController extends Controller
{
    public function index()
    {
        return Inertia::render('link-pembayaran/index', [
            'links' => [],
        ]);
    }
}
