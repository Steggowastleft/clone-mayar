<?php

namespace App\Http\Controllers\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
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

        $bootcamps = $pendaftaran->map(fn($p) => [
            'id'             => $p->bootcamp->id,
            'name'           => $p->bootcamp->name,
            'batch'          => $p->bootcamp->batch,
            'cover_url'      => $p->bootcamp->cover_url,
            'kategori'       => $p->bootcamp->kategori,
            'status'         => $p->status,
            'tanggal_aktif'  => $p->tanggal_aktif?->format('d M Y'),
            'tanggal_expired'=> $p->tanggal_expired?->format('d M Y'),
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
            ->with(['bootcamp.babs.materis', 'bootcamp.assignments'])
            ->firstOrFail();

        $bootcamp = $pendaftaran->bootcamp;

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
                    'urutan' => $m->urutan,
                ])->values(),
            ])->values(),
            'assignments' => $bootcamp->assignments->map(fn($a) => [
                'id'            => $a->id,
                'judul'         => $a->judul,
                'tugas'         => $a->tugas,
                'is_wajib'      => $a->is_wajib,
                'tanggal_mulai' => $a->tanggal_mulai?->format('d M Y'),
                'tanggal_akhir' => $a->tanggal_akhir?->format('d M Y'),
            ])->values(),
        ]);
    }
}