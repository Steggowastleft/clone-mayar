<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SemuaProdukController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('semua-produk/index', [
            'produk' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('semua-produk/indexcreate');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('semua-produk.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('semua-produk/indexshow', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('semua-produk/indexedit', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: update data
        return redirect()->route('semua-produk.index');
    }

    public function destroy(string $id)
    {
        // TODO: hapus data
        return redirect()->route('semua-produk.index');
    }
}
