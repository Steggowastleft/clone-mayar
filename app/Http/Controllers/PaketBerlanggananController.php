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
        return Inertia::render('paket-berlangganan/indexcreate');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('paket-berlangganan.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('paket-berlangganan/indexshow', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('paket-berlangganan/indexedit', [
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
}
