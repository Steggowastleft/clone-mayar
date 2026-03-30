<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;

class PesertaSubmissionController extends Controller
{
    public function store(Request $request, Assignment $assignment)
    {
        $request->validate([
            'submission_url'  => 'nullable|string|max:1000',
            'submission_teks' => 'nullable|string',
        ]);

        $peserta = Auth::guard('peserta')->user();

        // Cek apakah sudah pernah submit
        $existing = Submission::where('assignment_id', $assignment->id)
            ->where('peserta_id', $peserta->id)
            ->first();

        if ($existing) {
            return back()->withErrors(['general' => 'Kamu sudah mengumpulkan jawaban untuk assignment ini.']);
        }

        $submission = Submission::create([
            'assignment_id'   => $assignment->id,
            'peserta_id'      => $peserta->id,
            'submission_url'  => $request->submission_url,
            'submission_teks' => $request->submission_teks,
            'waktu_kirim'     => now(),
        ]);

        return back()->with('newSubmission', [
            'id'              => $submission->id,
            'submission_url'  => $submission->submission_url,
            'submission_teks' => $submission->submission_teks,
            'grade'           => null,
            'waktu_kirim'     => $submission->waktu_kirim->toISOString(),
        ]);
    }
}