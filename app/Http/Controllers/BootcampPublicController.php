<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BootcampPublicController extends Controller
{
    public function show(Bootcamp $bootcamp)
    {
        $bootcamp->load([
            'sesis',
            'babs.materis',
            'instruktur',
            'landingContents',
        ]);

        $contents = $bootcamp->landingContents->keyBy('section');

        // Cek peserta yang sedang login (guard terpisah dari admin)
        $peserta = Auth::guard('peserta')->user();

        return Inertia::render('bootcamps/public', [
            'bootcamp' => [
                'id'                         => $bootcamp->id,
                'name'                       => $bootcamp->name,
                'batch'                      => $bootcamp->batch,
                'status'                     => $bootcamp->status,
                'harga'                      => $bootcamp->harga,
                'harga_coret'                => $bootcamp->harga_coret,
                'deskripsi'                  => $bootcamp->deskripsi,
                'kategori'                   => $bootcamp->kategori,
                'cover_url'                  => $bootcamp->cover_url,
                'max_peserta'                => $bootcamp->max_peserta,
                'syarat_ketentuan'           => $bootcamp->syarat_ketentuan,
                'tanggal_mulai_pembelajaran' => $bootcamp->tanggal_mulai_pembelajaran?->format('d M Y'),
                'tanggal_batas_pembelajaran' => $bootcamp->tanggal_batas_pembelajaran?->format('d M Y'),
            ],

            // Data peserta yang sedang login (null jika belum login / login sebagai admin)
            'peserta' => $peserta ? [
                'id'    => $peserta->id,
                'nama'  => $peserta->nama,
                'email' => $peserta->email,
                'no_hp' => $peserta->no_hp,
            ] : null,

            'sesiList' => $bootcamp->sesis->map(fn($s) => [
                'judul'         => $s->judul,
                'is_online'     => (bool) $s->is_online,
                'lokasi'        => $s->lokasi,
                'link_sesi'     => $s->link_sesi,
                'waktu_mulai'   => $s->waktu_mulai?->format('d M Y, H:i'),
                'waktu_selesai' => $s->waktu_selesai?->format('H:i'),
                'nama_pemateri' => $s->nama_pemateri,
            ])->values()->toArray(),

            'babList' => $bootcamp->babs->map(fn($b) => [
                'judul'     => $b->judul,
                'deskripsi' => $b->deskripsi,
                'materis'   => $b->materis->map(fn($m) => [
                    'judul'  => $m->judul,
                    'tipe'   => $m->tipe,
                    'durasi' => $m->durasi,
                ])->values()->toArray(),
            ])->values()->toArray(),

            'instruktur' => $bootcamp->instruktur->map(fn($ins) => [
                'nama'     => $ins->nama,
                'jabatan'  => $ins->jabatan,
                'bio'      => $ins->bio,
                'foto_url' => $ins->foto_url,
            ])->values()->toArray(),

            'silabus'    => $this->toArray($contents->get('silabus')?->konten),
            'cocokUntuk' => $this->toArray($contents->get('cocok_untuk')?->konten),
            'outcome'    => $this->toArray($contents->get('outcome')?->konten),
            'faqs'       => $this->toArray($contents->get('faq')?->konten),
        ]);
    }

    private function toArray(mixed $value): array
    {
        if (is_null($value))   return [];
        if (is_array($value))  return $value;
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        return [];
    }
}