<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermintaanBayarController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('permintaan-bayar/index', [
            'permintaan' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('permintaan-bayar/buat');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama'        => 'required|string|max:255',
            'email'       => 'required|email',
            'jumlah'      => 'required|numeric|min:1',
            'keterangan'  => 'nullable|string',
            'kadaluarsa'  => 'nullable|date',
        ]);

        // TODO: simpan ke database

        return redirect()->route('permintaan-bayar.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('permintaan-bayar/show', [
            'id' => $id,
        ]);
    }

    public function destroy(string $id)
    {
        // TODO: hapus dari database

        return redirect()->route('permintaan-bayar.index');
    }
}
