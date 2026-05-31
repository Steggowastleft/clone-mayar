<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Soal;
use App\Models\QuizAttempt;
use App\Models\Submission;
use App\Models\Bootcamp;
use App\Models\KelasOnline;
use App\Models\Pendaftaran;
use App\Models\KelasOnlinePeserta;

class QuizController extends Controller
{
    public function submit(Request $request, Assignment $assignment)
    {
        $request->validate([
            'jawaban' => 'required|array',
        ]);

        $peserta = Auth::guard('peserta')->user();

        if ($assignment->tipe !== 'quiz') {
            return back()->withErrors(['general' => 'Assignment ini bukan quiz.']);
        }

        // Load soal-soal
        $soals = Soal::where('assignment_id', $assignment->id)->get();

        // Hitung nilai
        $totalPilganSoal = $soals->where('tipe_soal', 'pilihan_ganda')->count();
        $benar           = 0;

        foreach ($soals->where('tipe_soal', 'pilihan_ganda') as $soal) {
            $jawabanPeserta = $request->jawaban[$soal->id] ?? null;
            if ($jawabanPeserta === $soal->jawaban_benar) {
                $benar++;
            }
        }

        $nilai = $totalPilganSoal > 0
            ? (int) round(($benar / $totalPilganSoal) * 100)
            : 0;

        // Simpan attempt
        $attempt = QuizAttempt::create([
            'assignment_id' => $assignment->id,
            'peserta_id'    => $peserta->id,
            'jawaban'       => $request->jawaban,
            'nilai'         => $nilai,
            'dikerjakan_at' => now(),
        ]);

        $nilaiTertinggi = QuizAttempt::where('assignment_id', $assignment->id)
            ->where('peserta_id', $peserta->id)
            ->max('nilai');

        // Update atau buat submission
        Submission::updateOrCreate(
            [
                'assignment_id' => $assignment->id,
                'peserta_id'    => $peserta->id,
            ],
            [
                'submission_teks' => "Quiz selesai. Nilai tertinggi: {$nilaiTertinggi}",
                'grade'           => $nilaiTertinggi,
                'waktu_kirim'     => now(),
            ]
        );

        // Update status / progress
        if ($assignment->is_tugas_akhir) {
            if ($assignment->bootcamp_id) {
                Pendaftaran::where('registrable_id', $assignment->bootcamp_id)
                    ->where('registrable_type', Bootcamp::class)
                    ->where('peserta_id', $peserta->id)
                    ->update(['status' => 'completed', 'tanggal_expired' => now()]);
            } else if ($assignment->kelas_online_id) {
                KelasOnlinePeserta::where('kelas_online_id', $assignment->kelas_online_id)
                    ->where('peserta_id', $peserta->id)
                    ->update(['status' => 'completed']);
            }
        } else {
            if ($assignment->bootcamp_id) {
                $bootcamp = Bootcamp::with(['babs.materis', 'assignments'])->findOrFail($assignment->bootcamp_id);
                $progress = PesertaProgressController::hitungProgress($bootcamp, $peserta->id);
                PesertaProgressController::cekDanUpdateStatus($bootcamp, $peserta->id, $progress);
            }
        }

        // Trigger sertifikat jika ini Kelas Online
        if ($assignment->kelas_online_id) {
            $kelas = KelasOnline::find($assignment->kelas_online_id);
            if ($kelas) {
                app(\App\Services\CertificateService::class)->createCertificateIfEligible($kelas, $peserta);
            }
        }

        return back()->with('quizResult', [
            'nilai'          => $nilai,
            'nilai_tertinggi'=> $nilaiTertinggi,
            'benar'          => $benar,
            'total_pilgan'   => $totalPilganSoal,
            'attempt_ke'     => QuizAttempt::where('assignment_id', $assignment->id)
                                    ->where('peserta_id', $peserta->id)->count(),
            'jawaban_benar'  => $soals->where('tipe_soal', 'pilihan_ganda')
                                    ->pluck('jawaban_benar', 'id')->toArray(),
        ]);
    }
}