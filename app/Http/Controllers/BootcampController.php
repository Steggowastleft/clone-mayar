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
        $bootcamps = Bootcamp::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

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
            'user_id'                    => auth()->id(),
            'name'                       => $request->judul,
            'nama'                       => $request->judul,
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
        // ── Load semua relasi ────────────────────────────────────
        $bootcamp->load([
            'sesis',
            'babs.materis',
            'assignments.files',
            'assignments.soals',
            'assignments.submissions.peserta',
            'pendaftaran.peserta',
            'ratings.peserta',
        ]);

        // ── Submissions (untuk tab Grade) ────────────────────────
        $submissions = $bootcamp->assignments->flatMap(function ($assignment) {
            return $assignment->submissions->map(fn($s) => [
                'id'               => $s->id,
                'assignment_id'    => $assignment->id,
                'assignment_judul' => $assignment->judul,
                'peserta_id'       => $s->peserta_id,
                'peserta_nama'     => $s->peserta?->nama ?? '-',
                'peserta_email'    => $s->peserta?->email ?? '-',
                'peserta_no_hp'    => $s->peserta?->no_hp ?? null,
                'waktu_kirim'      => $s->waktu_kirim?->toISOString(),
                'submission_url'       => $s->submission_url,
                'submission_teks'      => $s->submission_teks,
                'submission_file'      => $s->submission_file,
                'submission_file_name' => $s->submission_file_name,
                'file_url'             => $s->file_url,
                'grade'                => $s->grade,
            ]);
        })->values()->toArray();

        $pesertaList = $bootcamp->pendaftaran->map(function ($item) use ($bootcamp) {
    $peserta = $item->peserta;

    // Ambil submission peserta
    $submissionPeserta = $bootcamp->assignments
        ->flatMap->submissions
        ->where('peserta_id', $item->peserta_id);

    // Hitung nilai rata-rata
    $nilaiList = $submissionPeserta
        ->pluck('grade')
        ->filter(function ($v) {
            return $v !== null;
        });

    $nilaiRata = $nilaiList->count()
        ? round($nilaiList->avg(), 1)
        : null;

    // Hitung progress
    $totalAssignment = $bootcamp->assignments->count();
    $progress = $totalAssignment > 0
        ? round(($submissionPeserta->count() / $totalAssignment) * 100)
        : 0;

    // Handle form_data
    $formData = $item->form_data;

    if (is_string($formData)) {
        $formData = json_decode($formData, true);
    }

    $formFlat = [];

    if (is_array($formData)) {
        foreach ($formData as $field) {
            if (isset($field['label']) && isset($field['value'])) {
                $formFlat[$field['label']] = $field['value'];
            }
        }
    }

    return [
        'id'             => $item->id,
        'nama'           => $peserta ? $peserta->nama : '-',
        'email'          => $peserta ? $peserta->email : '-',
        'no_hp'          => $peserta ? $peserta->no_hp : null,
        'status'         => $item->status ?? 'pending',
        'tanggal_daftar' => $item->created_at
            ? $item->created_at->toISOString()
            : null,
        'progress'       => $progress,
        'nilai_rata'     => $nilaiRata,
        'form_data'      => $formFlat,
    ];
})->values()->toArray();

        // ── Pembayaran List (untuk tab Pembayaran) ───────────────
        $pembayaranList = \App\Models\Pembayaran::where('bootcamp_id', $bootcamp->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($p) => [
                'id'            => $p->id,
                'order_id'      => $p->order_id,
                'nama_pembeli'  => $p->nama_pembeli,
                'email_pembeli' => $p->email_pembeli,
                'jumlah'        => (float) $p->jumlah,
                'status'        => $p->status,
                'bukti_url'     => $p->bukti_transfer
                    ? Storage::url($p->bukti_transfer)
                    : null,
                'catatan'       => $p->catatan,
                'created_at'    => $p->created_at->format('d M Y, H:i'),
                'confirmed_at'  => $p->confirmed_at?->format('d M Y, H:i'),
            ])->values()->toArray();

        // ── Render ───────────────────────────────────────────────
        return Inertia::render('bootcamps/detail', [

            // Bootcamp (tanpa relasi)
            'bootcamp' => [
                'id'                         => $bootcamp->id,
                'name'                       => $bootcamp->name,
                'batch'                      => $bootcamp->batch,
                'status'                     => $bootcamp->status,
                'date'                       => $bootcamp->date,
                'participants'               => $bootcamp->participants,
                'kategori'                   => $bootcamp->kategori,
                'harga'                      => (float) ($bootcamp->harga ?? 0),
                'tipe_pembayaran'            => $bootcamp->tipe_pembayaran,
                'deskripsi'                  => $bootcamp->deskripsi,
                'instruksi'                  => $bootcamp->instruksi,
                'syarat_ketentuan'           => $bootcamp->syarat_ketentuan,
                'cover_url'                  => $bootcamp->cover
                    ? asset('storage/' . $bootcamp->cover)
                    : null,
                'tanggal_mulai_jual'         => $bootcamp->tanggal_mulai_jual,
                'tanggal_tutup_daftar'       => $bootcamp->tanggal_tutup_daftar,
                'tanggal_mulai_pembelajaran' => $bootcamp->tanggal_mulai_pembelajaran,
                'tanggal_batas_pembelajaran' => $bootcamp->tanggal_batas_pembelajaran,
            ],

            // Sesi
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

            // Bab + Materi
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

            // Assignment List — lengkap dengan tipe, soals, is_wajib, is_tugas_akhir
            'assignmentList' => $bootcamp->assignments->map(fn($a) => [
                'id'             => $a->id,
                'judul'          => $a->judul,
                'tugas'          => $a->tugas,
                'tipe'           => $a->tipe ?? 'upload',
                'is_wajib'       => (bool) $a->is_wajib,
                'is_tugas_akhir' => (bool) $a->is_tugas_akhir,
                'tanggal_mulai'  => $a->tanggal_mulai?->format('d M Y'),
                'tanggal_akhir'  => $a->tanggal_akhir?->format('d M Y'),
                'files'          => $a->files->map(fn($f) => [
                    'id'   => $f->id,
                    'name' => $f->name,
                    'url'  => $f->url,
                    'size' => $f->size,
                ])->values()->toArray(),
                'soals' => $a->soals->sortBy('urutan')->map(fn($s) => [
                    'id'            => $s->id,
                    'pertanyaan'    => $s->pertanyaan,
                    'tipe_soal'     => $s->tipe_soal,
                    'pilihan'       => $s->pilihan,
                    'jawaban_benar' => $s->jawaban_benar, // penjual boleh lihat
                    'urutan'        => $s->urutan,
                ])->values()->toArray(),
            ])->values()->toArray(),

            // Assignments dropdown untuk tab Grade
            'assignments' => $bootcamp->assignments->map(fn($a) => [
                'id'    => $a->id,
                'judul' => $a->judul,
            ])->values()->toArray(),

            // Submissions untuk tab Grade
            'submissions' => $submissions,

            // Peserta
            'pesertaList' => $pesertaList,

            // Ratings
            'ratings' => $bootcamp->ratings->map(fn($r) => [
                'id'           => $r->id,
                'bintang'      => $r->bintang,
                'ulasan'       => $r->ulasan,
                'tampil_anonim'=> (bool) $r->tampil_anonim,
                'foto_url'     => $r->foto_url,
                'nama_peserta' => $r->tampil_anonim ? 'Anonim' : ($r->peserta?->nama ?? '-'),
                'created_at'   => $r->created_at->toISOString(),
            ])->values()->toArray(),

            // Pembayaran
            'pembayaranList' => $pembayaranList,
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