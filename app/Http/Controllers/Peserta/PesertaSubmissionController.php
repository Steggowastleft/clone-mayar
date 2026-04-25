<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Bootcamp;
use App\Models\Submission;
use App\Models\Pendaftaran;

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

        // Kalau ini Tugas Akhir, pastikan semua materi + tugas reguler sudah selesai
        if ($assignment->is_tugas_akhir) {
            $bootcamp = Bootcamp::with(['babs.materis', 'assignments'])
                ->findOrFail($assignment->bootcamp_id);

            $allDone = $this->cekSemuaMateriSelesai($bootcamp, $peserta->id);
            if (!$allDone) {
                return back()->withErrors(['general' => 'Selesaikan semua materi dan tugas terlebih dahulu.']);
            }
        }

        $submission = Submission::create([
            'assignment_id'   => $assignment->id,
            'peserta_id'      => $peserta->id,
            'submission_url'  => $request->submission_url,
            'submission_teks' => $request->submission_teks,
            'waktu_kirim'     => now(),
        ]);

        // Jika Tugas Akhir → langsung selesaikan kelas
        if ($assignment->is_tugas_akhir) {
            Pendaftaran::where('bootcamp_id', $assignment->bootcamp_id)
                ->where('peserta_id', $peserta->id)
                ->where('status', 'active')
                ->update([
                    'status'          => 'completed',
                    'tanggal_expired' => now(),
                ]);
        } else {
            // Tugas biasa — cek progress normal
            $bootcamp = Bootcamp::with(['babs.materis', 'assignments'])
                ->findOrFail($assignment->bootcamp_id);

            $progress = PesertaProgressController::hitungProgress($bootcamp, $peserta->id);
            PesertaProgressController::cekDanUpdateStatus($bootcamp, $peserta->id, $progress);
        }

        return back()->with('newSubmission', [
            'id'              => $submission->id,
            'submission_url'  => $submission->submission_url,
            'submission_teks' => $submission->submission_teks,
            'grade'           => null,
            'waktu_kirim'     => $submission->waktu_kirim->toISOString(),
        ]);
    }

    /**
     * Cek apakah semua materi sudah dibaca DAN semua tugas per materi sudah disubmit
     */
    private function cekSemuaMateriSelesai(Bootcamp $bootcamp, int $pesertaId): bool
    {
        $allMateris = $bootcamp->babs->flatMap(fn($b) => $b->materis);

        // Load progress materi
        $materiSelesai = \App\Models\ProgressMateri::where('peserta_id', $pesertaId)
            ->where('bootcamp_id', $bootcamp->id)
            ->pluck('materi_id')
            ->toArray();

        // Load submissions peserta
        $submittedAssignments = Submission::where('peserta_id', $pesertaId)
            ->whereIn('assignment_id', $bootcamp->assignments->pluck('id'))
            ->pluck('assignment_id')
            ->toArray();

        foreach ($allMateris as $materi) {
            // Belum baca materi
            if (!in_array($materi->id, $materiSelesai)) return false;

            // Punya tugas wajib tapi belum submit
            if ($materi->assignment_id && !in_array($materi->assignment_id, $submittedAssignments)) {
                return false;
            }
        }

        return true;
    }
}