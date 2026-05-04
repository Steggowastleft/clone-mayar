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

        // Trigger sertifikat jika ini Kelas Online
        $assignment = $submission->assignment;
        if ($assignment && $assignment->kelas_online_id) {
            $kelas = \App\Models\KelasOnline::find($assignment->kelas_online_id);
            if ($kelas) {
                app(\App\Services\CertificateService::class)->createCertificateIfEligible($kelas, $submission->peserta);
            }
        }

        return back();
    }
}