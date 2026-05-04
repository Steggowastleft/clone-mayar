<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EbookController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('ebook/index', [
            'produk' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('ebook/indexcreate');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('ebook.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('ebook/indexshow', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('ebook/indexedit', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: update data
        return redirect()->route('ebook.index');
    }

    public function destroy(string $id)
    {
        // TODO: hapus data
        return redirect()->route('ebook.index');
    }
}
