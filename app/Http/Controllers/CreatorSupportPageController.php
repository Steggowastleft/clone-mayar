<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreatorSupportPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('creator-support-page/index', [
            'produk' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('creator-support-page/index');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('creator-support-page.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('creator-support-page/index', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('creator-support-page/index', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: update data
        return redirect()->route('creator-support-page.index');
    }

    public function destroy(string $id)
    {
        // TODO: hapus data
        return redirect()->route('creator-support-page.index');
    }

    public function catalog()
    {
        // For now returning empty until Model is implemented
        return Inertia::render('creator-support-page/catalog', [
            'produk' => [],
        ]);
    }
}
