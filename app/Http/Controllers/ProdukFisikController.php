<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProdukFisikController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('produk-fisik/index', [
            'produk' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('produk-fisik/indexcreate');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('produk-fisik.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('produk-fisik/indexshow', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('produk-fisik/indexedit', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: update data
        return redirect()->route('produk-fisik.index');
    }

    public function destroy(string $id)
    {
        // TODO: hapus data
        return redirect()->route('produk-fisik.index');
    }
}
