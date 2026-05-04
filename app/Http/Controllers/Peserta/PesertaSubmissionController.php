<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Bootcamp;
use App\Models\KelasOnline;
use App\Models\Submission;
use App\Models\Pendaftaran;
use App\Models\KelasOnlinePeserta;

class PesertaSubmissionController extends Controller
{
    public function store(Request $request, Assignment $assignment)
    {
        $request->validate([
            'submission_url'  => 'nullable|string|max:1000',
            'submission_teks' => 'nullable|string',
            'submission_file' => 'nullable|file|max:10240', // max 10MB
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
            if ($assignment->bootcamp_id) {
                $bootcamp = Bootcamp::with(['babs.materis', 'assignments'])
                    ->findOrFail($assignment->bootcamp_id);

                $allDone = $this->cekSemuaMateriSelesaiBootcamp($bootcamp, $peserta->id);
                if (!$allDone) {
                    return back()->withErrors(['general' => 'Selesaikan semua materi dan tugas terlebih dahulu.']);
                }
            } else if ($assignment->kelas_online_id) {
                // Untuk Kelas Online, Tugas Akhir biasanya opsional atau diatur berbeda
                // Tapi kita bisa implementasi cek dasar jika perlu
            }
        }

        $filePath = null;
        $fileName = null;
        if ($request->hasFile('submission_file')) {
            $file = $request->file('submission_file');
            $filePath = $file->store("submissions/{$assignment->id}", 'public');
            $fileName = $file->getClientOriginalName();
        }

        $submission = Submission::create([
            'assignment_id'        => $assignment->id,
            'peserta_id'           => $peserta->id,
            'submission_url'       => $request->submission_url,
            'submission_teks'      => $request->submission_teks,
            'submission_file'      => $filePath,
            'submission_file_name' => $fileName,
            'waktu_kirim'          => now(),
        ]);

        // Update status pendaftaran jika Tugas Akhir
        if ($assignment->is_tugas_akhir) {
            if ($assignment->bootcamp_id) {
                Pendaftaran::where('bootcamp_id', $assignment->bootcamp_id)
                    ->where('peserta_id', $peserta->id)
                    ->update(['status' => 'completed', 'tanggal_expired' => now()]);
            } else if ($assignment->kelas_online_id) {
                KelasOnlinePeserta::where('kelas_online_id', $assignment->kelas_online_id)
                    ->where('peserta_id', $peserta->id)
                    ->update(['status' => 'completed']);
            }
        } else {
            // Update progress jika Bootcamp
            if ($assignment->bootcamp_id) {
                $bootcamp = Bootcamp::with(['babs.materis', 'assignments'])
                    ->findOrFail($assignment->bootcamp_id);

                $progress = PesertaProgressController::hitungProgress($bootcamp, $peserta->id);
                PesertaProgressController::cekDanUpdateStatus($bootcamp, $peserta->id, $progress);
            }
        }

        return back()->with('newSubmission', [
            'id'                   => $submission->id,
            'submission_url'       => $submission->submission_url,
            'submission_teks'      => $submission->submission_teks,
            'submission_file'      => $submission->submission_file,
            'submission_file_name' => $submission->submission_file_name,
            'file_url'             => $submission->file_url,
            'grade'                => null,
            'waktu_kirim'          => $submission->waktu_kirim->toISOString(),
        ]);
    }

    private function cekSemuaMateriSelesaiBootcamp(Bootcamp $bootcamp, int $pesertaId): bool
    {
        $allMateris = $bootcamp->babs->flatMap(fn($b) => $b->materis);
        $materiSelesai = \App\Models\ProgressMateri::where('peserta_id', $pesertaId)
            ->where('bootcamp_id', $bootcamp->id)
            ->pluck('materi_id')
            ->toArray();

        $submittedAssignments = Submission::where('peserta_id', $pesertaId)
            ->whereIn('assignment_id', $bootcamp->assignments->pluck('id'))
            ->pluck('assignment_id')
            ->toArray();

        foreach ($allMateris as $materi) {
            if (!in_array($materi->id, $materiSelesai)) return false;
            if ($materi->assignment_id && !in_array($materi->assignment_id, $submittedAssignments)) {
                return false;
            }
        }

        return true;
    }
}