<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoachingMentoringController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('coaching-mentoring/index', [
            'produk' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('coaching-mentoring/indexcreate');
    }

    public function store(Request $request)
    {
        // TODO: validasi & simpan data
        return redirect()->route('coaching-mentoring.index');
    }

    public function show(string $id): Response
    {
        return Inertia::render('coaching-mentoring/indexshow', [
            'id' => $id,
        ]);
    }

    public function edit(string $id): Response
    {
        return Inertia::render('coaching-mentoring/indexedit', [
            'id' => $id,
        ]);
    }

    public function update(Request $request, string $id)
    {
        // TODO: update data
        return redirect()->route('coaching-mentoring.index');
    }

    public function destroy(string $id)
    {
        // TODO: hapus data
        return redirect()->route('coaching-mentoring.index');
    }
}
