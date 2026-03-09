<?php

// ══════════════════════════════════════════════════════════
// app/Http/Controllers/KustomFormController.php
// ══════════════════════════════════════════════════════════

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\KustomForm;
use Illuminate\Http\Request;

class KustomFormController extends Controller
{
    public function store(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'fields'          => 'nullable|array',
            'fields.*.id'     => 'required|string',
            'fields.*.type'   => 'required|string',
            'fields.*.label'  => 'nullable|string|max:255',
            'fields.*.help_text'   => 'nullable|string|max:500',
            'fields.*.is_required' => 'required|boolean',
            'apply'           => 'nullable|boolean',
        ]);

        KustomForm::updateOrCreate(
            ['bootcamp_id' => $bootcamp->id],
            [
                'fields'      => $request->fields ?? [],
                'is_applied'  => $request->boolean('apply'),
            ]
        );

        return back();
    }

    public function show(Bootcamp $bootcamp)
    {
        $form = KustomForm::where('bootcamp_id', $bootcamp->id)->first();
        return response()->json([
            'fields'     => $form?->fields ?? [],
            'is_applied' => $form?->is_applied ?? false,
        ]);
    }
}