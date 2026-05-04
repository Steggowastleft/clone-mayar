<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaketBerlanggananController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('paket-berlangganan/index', [
            'produk' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('paket-berlangganan/index');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('paket-berlangganan.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('paket-berlangganan/index', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('paket-berlangganan/index', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: update data
        return redirect()->route('paket-berlangganan.index');
    }

    public function destroy(string $id)
    {
        // TODO: hapus data
        return redirect()->route('paket-berlangganan.index');
    }

    public function catalog()
    {
        // For now returning empty until Model is implemented
        return Inertia::render('paket-berlangganan/catalog', [
            'produk' => [],
        ]);
    }
}
