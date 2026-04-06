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
        return Inertia::render('audio-book/indexcreate');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('audio-book.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('audio-book/indexshow', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('audio-book/indexedit', [
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
}
