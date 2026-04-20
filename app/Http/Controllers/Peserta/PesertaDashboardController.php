<?php

namespace App\Http\Controllers\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use App\Models\Rating;
use App\Models\ProgressMateri;
use App\Models\QuizAttempt;
use App\Models\Soal;
use App\Models\Submission;
use App\Http\Controllers\Peserta\PesertaProgressController;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PesertaDashboardController extends Controller
{
    public function index()
    {
        $peserta = Auth::guard('peserta')->user();

        $pendaftaran = Pendaftaran::with(['bootcamp'])
            ->where('peserta_id', $peserta->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Load ratings peserta
        $myRatings = Rating::where('peserta_id', $peserta->id)
            ->pluck('bintang', 'bootcamp_id');

        $bootcamps = $pendaftaran->map(fn($p) => [
            'id'             => $p->bootcamp->id,
            'name'           => $p->bootcamp->name,
            'batch'          => $p->bootcamp->batch,
            'cover_url'      => $p->bootcamp->cover_url,
            'kategori'       => $p->bootcamp->kategori,
            'status'         => $p->status,
            'tanggal_aktif'  => $p->tanggal_aktif?->format('d M Y'),
            'tanggal_expired'=> $p->tanggal_expired?->format('d M Y'),
            'rating'         => $myRatings->get($p->bootcamp->id),
        ]);

        return Inertia::render('Peserta/dashboard', [
            'peserta'   => [
                'id'       => $peserta->id,
                'nama'     => $peserta->nama,
                'email'    => $peserta->email,
                'no_hp'    => $peserta->no_hp,
                'foto_url' => $peserta->foto_url,
            ],
            'bootcamps' => $bootcamps,
        ]);
    }

    public function kelas($bootcampId)
    {
        $peserta = Auth::guard('peserta')->user();

        // Cek akses
        $pendaftaran = Pendaftaran::where('bootcamp_id', $bootcampId)
            ->where('peserta_id', $peserta->id)
            ->where('status', 'active')
            ->with([
                'bootcamp.babs.materis',
                'bootcamp.assignments.soals',
            ])
            ->firstOrFail();

        $bootcamp = $pendaftaran->bootcamp;

        // Load progress materi milik peserta ini
        $myProgress = ProgressMateri::where('peserta_id', $peserta->id)
            ->where('bootcamp_id', $bootcamp->id)
            ->pluck('materi_id')
            ->toArray();

        // Load nilai tertinggi quiz per assignment
        $myQuizBest = QuizAttempt::where('peserta_id', $peserta->id)
            ->whereIn('assignment_id', $bootcamp->assignments->pluck('id'))
            ->selectRaw('assignment_id, MAX(nilai) as nilai_tertinggi, COUNT(*) as attempt_ke')
            ->groupBy('assignment_id')
            ->get()
            ->keyBy('assignment_id');

        // Load submissions milik peserta ini
        $mySubmissions = Submission::where('peserta_id', $peserta->id)
            ->whereIn('assignment_id', $bootcamp->assignments->pluck('id'))
            ->get()
            ->keyBy('assignment_id');

        return Inertia::render('Peserta/kelas', [
            'peserta'  => [
                'id'   => $peserta->id,
                'nama' => $peserta->nama,
            ],
            'bootcamp' => [
                'id'    => $bootcamp->id,
                'name'  => $bootcamp->name,
                'batch' => $bootcamp->batch,
            ],
            'babList' => $bootcamp->babs->map(fn($b) => [
                'id'      => $b->id,
                'judul'   => $b->judul,
                'urutan'  => $b->urutan,
                'materis' => $b->materis->map(fn($m) => [
                    'id'     => $m->id,
                    'judul'  => $m->judul,
                    'tipe'   => $m->tipe,
                    'konten' => $m->konten,
                    'durasi' => $m->durasi,
                    'urutan'        => $m->urutan,
                    'is_selesai'    => in_array($m->id, $myProgress),
                    'assignment_id' => $m->assignment_id,
                ])->values(),
            ])->values(),
            'progressPersen' => PesertaProgressController::hitungProgress($bootcamp, $peserta->id),
            'assignments' => $bootcamp->assignments->map(function ($a) use ($mySubmissions, $myQuizBest) {
                $sub  = $mySubmissions->get($a->id);
                $quiz = $myQuizBest->get($a->id);
                return [
                    'id'             => $a->id,
                    'judul'          => $a->judul,
                    'tugas'          => $a->tugas,
                    'is_wajib'       => $a->is_wajib,
                    'tanggal_mulai'  => $a->tanggal_mulai?->format('d M Y'),
                    'tanggal_akhir'  => $a->tanggal_akhir?->format('d M Y'),
                    'is_tugas_akhir' => (bool) $a->is_tugas_akhir,
                    'tipe'           => $a->tipe ?? 'upload',
                    'soals'          => $a->soals->sortBy('urutan')->map(fn($s) => [
                        'id'         => $s->id,
                        'pertanyaan' => $s->pertanyaan,
                        'tipe_soal'  => $s->tipe_soal,
                        'pilihan'    => $s->pilihan,
                        'urutan'     => $s->urutan,
                        // jawaban_benar TIDAK dikirim ke peserta!
                    ])->values()->toArray(),
                    'nilai_tertinggi' => $quiz?->nilai_tertinggi,
                    'attempt_ke'      => $quiz?->attempt_ke ?? 0,
                    'submission'      => $sub ? [
                        'id'              => $sub->id,
                        'submission_url'  => $sub->submission_url,
                        'submission_teks' => $sub->submission_teks,
                        'grade'           => $sub->grade,
                        'waktu_kirim'     => $sub->waktu_kirim?->toISOString(),
                    ] : null,
                ];
            })->values(),
        ]);
    }
}