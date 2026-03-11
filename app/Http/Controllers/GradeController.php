<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * Simpan atau update nilai submission peserta.
     * POST /submissions/{submission}/grade
     */
    public function store(Request $request, Submission $submission)
    {
        $request->validate([
            'grade' => 'required|numeric|min:0|max:100',
        ]);

        $submission->update([
            'grade' => $request->grade,
        ]);

        return back();
    }
}