<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AudioBookController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('audio-book/index', [
            'produk' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('audio-book/index');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('audio-book.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('audio-book/index', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('audio-book/index', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: update data
        return redirect()->route('audio-book.index');
    }

    public function destroy(string $id)
    {
        // TODO: hapus data
        return redirect()->route('audio-book.index');
    }

    public function catalog()
    {
        // For now returning empty until Model is implemented
        return Inertia::render('audio-book/catalog', [
            'produk' => [],
        ]);
    }
}
