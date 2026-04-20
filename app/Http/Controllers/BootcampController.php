<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Bootcamp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BootcampController extends Controller
{
    public function index()
    {
        $bootcamps = Bootcamp::orderBy('created_at', 'desc')->get();

        return Inertia::render('bootcamps/index', [
            'bootcamps' => $bootcamps,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul'                    => 'required|string|max:255',
            'kategori'                 => 'nullable|string|max:255',
            'tipePembayaran'           => 'nullable|string|max:100',
            'harga'                    => 'nullable|numeric|min:0',
            'hargaCoret'               => 'nullable|numeric|min:0',
            'deskripsi'                => 'nullable|string',
            'instruksi'                => 'nullable|string',
            'syaratKetentuan'          => 'nullable|string',
            'maxPeserta'               => 'nullable|integer|min:0',
            'batasNilaiQuiz'           => 'nullable|numeric|min:0|max:100',
            'redirectUrl'              => 'nullable|url|max:500',
            'bisaAffiliate'            => 'nullable',
            'tanggalMulaiJual'         => 'nullable|date',
            'tanggalTutupDaftar'       => 'nullable|date',
            'tanggalMulaiPembelajaran' => 'nullable|date',
            'tanggalBatasPembelajaran' => 'nullable|date',
            'cover'                    => 'nullable|image|max:5120',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('bootcamp-covers', 'public');
        }

        $bootcamp = Bootcamp::create([
            'name'                       => $request->judul,
            'batch'                      => 'Batch 1',
            'status'                     => 'unpublished',
            'kategori'                   => $request->kategori,
            'tipe_pembayaran'            => $request->tipePembayaran,
            'harga'                      => $request->harga ?? 0,
            'harga_coret'                => $request->hargaCoret,
            'deskripsi'                  => $request->deskripsi,
            'instruksi'                  => $request->instruksi,
            'syarat_ketentuan'           => $request->syaratKetentuan,
            'max_peserta'                => $request->maxPeserta,
            'batas_nilai_quiz'           => $request->batasNilaiQuiz,
            'redirect_url'               => $request->redirectUrl,
            'bisa_affiliate'             => $request->bisaAffiliate ? true : false,
            'tanggal_mulai_jual'         => $request->tanggalMulaiJual,
            'tanggal_tutup_daftar'       => $request->tanggalTutupDaftar,
            'tanggal_mulai_pembelajaran' => $request->tanggalMulaiPembelajaran,
            'tanggal_batas_pembelajaran' => $request->tanggalBatasPembelajaran,
            'cover'                      => $coverPath,
            'participants'               => 0,
            'date'                       => now()->format('Y-m-d'),
        ]);

        return redirect()->route('bootcamps.show', $bootcamp->id);
    }

    public function show(Bootcamp $bootcamp)
    {
        // Load semua relasi sekaligus
        $bootcamp->load([
            'sesis',
            'babs.materis',
            'assignments.files',
            'assignments.soals',
            'assignments.submissions.peserta',
            'pendaftaran.peserta',
            'assignments.submissions',
            'ratings.peserta',
        ]);

        // Flatten submissions dari semua assignment
        $submissions = $bootcamp->assignments->flatMap(function ($assignment) {
            return $assignment->submissions->map(fn($s) => [
                'id'               => $s->id,
                'assignment_id'    => $assignment->id,
                'assignment_judul' => $assignment->judul,
                'peserta_id'       => $s->peserta_id,
                'peserta_nama'     => $s->peserta->nama,
                'peserta_email'    => $s->peserta->email,
                'peserta_no_hp'    => $s->peserta->no_hp ?? null,
                'waktu_kirim'      => $s->waktu_kirim?->toISOString(),
                'submission_url'   => $s->submission_url,
                'submission_teks'  => $s->submission_teks,
                'grade'            => $s->grade,
            ]);
        })->values()->toArray();

        return Inertia::render('bootcamps/detail', [

            // ── Bootcamp (tanpa relasi) ──────────────────────────────
            'bootcamp' => [
                'id'                         => $bootcamp->id,
                'name'                       => $bootcamp->name,
                'batch'                      => $bootcamp->batch,
                'status'                     => $bootcamp->status,
                'date'                       => $bootcamp->date,
                'participants'               => $bootcamp->participants,
                'kategori'                   => $bootcamp->kategori,
                'harga'                      => $bootcamp->harga,
                'deskripsi'                  => $bootcamp->deskripsi,
                'instruksi'                  => $bootcamp->instruksi,
                'syarat_ketentuan'           => $bootcamp->syarat_ketentuan,
                'cover'                      => $bootcamp->cover,
                'cover_url'                  => $bootcamp->cover
                                                    ? asset('storage/' . $bootcamp->cover)
                                                    : null,
                'tanggal_mulai_jual'         => $bootcamp->tanggal_mulai_jual,
                'tanggal_tutup_daftar'       => $bootcamp->tanggal_tutup_daftar,
                'tanggal_mulai_pembelajaran' => $bootcamp->tanggal_mulai_pembelajaran,
                'tanggal_batas_pembelajaran' => $bootcamp->tanggal_batas_pembelajaran,
            ],

            // ── Sesi list ────────────────────────────────────────────
            'sesiList' => $bootcamp->sesis->map(fn($s) => [
                'id'              => $s->id,
                'judul'           => $s->judul,
                'deskripsi'       => $s->deskripsi,
                'is_online'       => (bool) $s->is_online,
                'link_sesi'       => $s->link_sesi,
                'lokasi'          => $s->lokasi,
                'lat'             => $s->lat,
                'lng'             => $s->lng,
                'nama_pemateri'   => $s->nama_pemateri,
                'profil_pemateri' => $s->profil_pemateri,
                'waktu_mulai'     => $s->waktu_mulai?->format('d M Y, H:i'),
                'waktu_selesai'   => $s->waktu_selesai?->format('H:i'),
            ])->values()->toArray(),

            // ── Bab + Materi list ────────────────────────────────────
            'babList' => $bootcamp->babs->map(fn($b) => [
                'id'        => $b->id,
                'judul'     => $b->judul,
                'deskripsi' => $b->deskripsi,
                'urutan'    => $b->urutan,
                'materis'   => $b->materis->map(fn($m) => [
                    'id'     => $m->id,
                    'judul'  => $m->judul,
                    'tipe'   => $m->tipe,
                    'konten' => $m->konten,
                    'durasi' => $m->durasi,
                    'urutan' => $m->urutan,
                ])->values()->toArray(),
            ])->values()->toArray(),

            // ── Assignment list (tab Assignment) ─────────────────────
            'assignmentList' => $bootcamp->assignments->map(fn($a) => [
                'id'            => $a->id,
                'judul'         => $a->judul,
                'tugas'         => $a->tugas,
                'is_wajib'      => (bool) $a->is_wajib,
                'is_tugas_akhir' => (bool) $a->is_tugas_akhir,
                'tanggal_mulai' => $a->tanggal_mulai?->format('d M Y'),
                'tanggal_akhir' => $a->tanggal_akhir?->format('d M Y'),
                'files'         => $a->files->map(fn($f) => [
                    'id'   => $f->id,
                    'name' => $f->name,
                    'url'  => $f->url,
                    'size' => $f->size,
                ])->values()->toArray(),
                'tipe'           => $a->tipe ?? 'upload',
                'soals'          => $a->soals->sortBy('urutan')->map(fn($s) => [
                    'id'           => $s->id,
                    'pertanyaan'   => $s->pertanyaan,
                    'tipe_soal'    => $s->tipe_soal,
                    'pilihan'      => $s->pilihan,
                    'jawaban_benar'=> $s->jawaban_benar, // penjual boleh lihat
                    'urutan'       => $s->urutan,
                ])->values()->toArray(),
            ])->values()->toArray(),

            // ── Tab Grade: dropdown assignments ──────────────────────
            'assignments' => $bootcamp->assignments->map(fn($a) => [
                'id'    => $a->id,
                'judul' => $a->judul,
            ])->values()->toArray(),

            // ── Tab Grade: semua submissions ─────────────────────────
            'submissions' => $submissions,

            // ── Tab Rating ───────────────────────────────────────────
            'ratings' => $bootcamp->ratings->map(fn($r) => [
                'id'           => $r->id,
                'bintang'      => $r->bintang,
                'ulasan'       => $r->ulasan,
                'tampil_anonim'=> (bool) $r->tampil_anonim,
                'foto_url'     => $r->foto_url,
                'nama_peserta' => $r->tampil_anonim ? 'Anonim' : $r->peserta->nama,
                'created_at'   => $r->created_at->toISOString(),
            ])->values()->toArray(),

            // ── Tab Peserta ───────────────────────────────────────────
            'pesertaList' => $bootcamp->pendaftaran->map(function ($p) use ($bootcamp) {
                $peserta = $p->peserta;

                // Guard: skip jika peserta null
                if (!$peserta) return null;

                // Hitung progress dari tabel progress_materis
                $totalMateri     = $bootcamp->babs->sum(fn($b) => $b->materis->count());
                $totalAssignment = $bootcamp->assignments->count();
                $totalItem       = $totalMateri + $totalAssignment;
                $materiDibaca    = \App\Models\ProgressMateri::where('peserta_id', $peserta->id)
                                    ->where('bootcamp_id', $bootcamp->id)->count();
                $assignSubmit    = $bootcamp->assignments->flatMap(fn($a) => $a->submissions)
                                    ->where('peserta_id', $peserta->id)->count();
                $progress = $totalItem > 0
                    ? (int) round((($materiDibaca + $assignSubmit) / $totalItem) * 100)
                    : 0;

                // Hitung nilai rata-rata dari submissions
                $submissions = $bootcamp->assignments->flatMap(fn($a) => $a->submissions)
                    ->where('peserta_id', $peserta->id)
                    ->whereNotNull('grade');
                $nilaiRata = $submissions->count() > 0
                    ? round($submissions->avg('grade'), 1)
                    : null;

                // Decode form_data JSON jika masih string
                $formData = $p->form_data;
                if (is_string($formData)) {
                    $formData = json_decode($formData, true);
                }

                // Ambil nilai dari dalam form_data (format: {key: {label, value}})
                $formFlat = [];
                if (is_array($formData)) {
                    foreach ($formData as $key => $field) {
                        if (isset($field['label']) && isset($field['value'])) {
                            $formFlat[$field['label']] = $field['value'];
                        }
                    }
                }

                return [
                    'id'             => $p->id,
                    'nama'           => $peserta->nama,
                    'email'          => $peserta->email,
                    'no_hp'          => $peserta->no_hp ?? null,
                    'status'         => $p->status,
                    'tanggal_daftar' => $p->tanggal_daftar
                                        ? \Carbon\Carbon::parse($p->tanggal_daftar)->toISOString()
                                        : $p->created_at->toISOString(),
                    'progress'       => $progress,
                    'nilai_rata'     => $nilaiRata,
                    'form_data'      => $formFlat,
                ];
            })->filter()->values()->toArray(),
        ]);
    }

    public function update(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'judul'                    => 'required|string|max:255',
            'kategori'                 => 'nullable|string|max:255',
            'tipePembayaran'           => 'nullable|string|max:100',
            'harga'                    => 'nullable|numeric|min:0',
            'hargaCoret'               => 'nullable|numeric|min:0',
            'deskripsi'                => 'nullable|string',
            'instruksi'                => 'nullable|string',
            'syaratKetentuan'          => 'nullable|string',
            'maxPeserta'               => 'nullable|integer|min:0',
            'batasNilaiQuiz'           => 'nullable|numeric|min:0|max:100',
            'redirectUrl'              => 'nullable|url|max:500',
            'bisaAffiliate'            => 'nullable',
            'tanggalMulaiJual'         => 'nullable|date',
            'tanggalTutupDaftar'       => 'nullable|date',
            'tanggalMulaiPembelajaran' => 'nullable|date',
            'tanggalBatasPembelajaran' => 'nullable|date',
            'cover'                    => 'nullable|image|max:5120',
        ]);

        $data = [
            'name'                       => $request->judul,
            'kategori'                   => $request->kategori,
            'tipe_pembayaran'            => $request->tipePembayaran,
            'harga'                      => $request->harga ?? 0,
            'harga_coret'                => $request->hargaCoret,
            'deskripsi'                  => $request->deskripsi,
            'instruksi'                  => $request->instruksi,
            'syarat_ketentuan'           => $request->syaratKetentuan,
            'max_peserta'                => $request->maxPeserta,
            'batas_nilai_quiz'           => $request->batasNilaiQuiz,
            'redirect_url'               => $request->redirectUrl,
            'bisa_affiliate'             => $request->bisaAffiliate ? true : false,
            'tanggal_mulai_jual'         => $request->tanggalMulaiJual,
            'tanggal_tutup_daftar'       => $request->tanggalTutupDaftar,
            'tanggal_mulai_pembelajaran' => $request->tanggalMulaiPembelajaran,
            'tanggal_batas_pembelajaran' => $request->tanggalBatasPembelajaran,
        ];

        if ($request->hasFile('cover')) {
            if ($bootcamp->cover) {
                Storage::disk('public')->delete($bootcamp->cover);
            }
            $data['cover'] = $request->file('cover')->store('bootcamp-covers', 'public');
        }

        $bootcamp->update($data);

        return redirect()->route('bootcamps.show', $bootcamp->id);
    }

    public function updateStatus(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $bootcamp->update(['status' => $request->status]);

        return back();
    }

    public function duplicate(Bootcamp $bootcamp)
    {
        $new         = $bootcamp->replicate();
        $new->name   = 'DUPLICATE - ' . $bootcamp->name;
        $new->status = 'unpublished';
        $new->save();

        return redirect()->route('bootcamps.show', $new->id);
    }

    public function destroy(Bootcamp $bootcamp)
    {
        if ($bootcamp->cover) {
            Storage::disk('public')->delete($bootcamp->cover);
        }

        $bootcamp->delete();

        return redirect()->route('bootcamps.index');
    }
}