<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\Sertifikat;
use App\Models\Pendaftaran;
use App\Models\Bootcamp;
use Inertia\Inertia;

class SertifikatController extends Controller
{
    /**
     * Tampilkan halaman sertifikat peserta
     */
    public function show(Bootcamp $bootcamp)
    {
        $peserta = Auth::guard('peserta')->user();

        // Cek apakah kelas sudah selesai
        $pendaftaran = Pendaftaran::where('registrable_id', $bootcamp->id)
            ->where('registrable_type', Bootcamp::class)
            ->where('peserta_id', $peserta->id)
            ->whereIn('status', ['completed'])
            ->firstOrFail();

        // Ambil atau buat sertifikat
        $sertifikat = Sertifikat::firstOrCreate(
            [
                'peserta_id'  => $peserta->id,
                'bootcamp_id' => $bootcamp->id,
            ],
            [
                'nomor_sertifikat' => Sertifikat::generateNomor(),
                'nama_peserta'     => $peserta->nama,
                'nama_bootcamp'    => $bootcamp->name,
                'nama_instruktur'  => $bootcamp->instruktur()->first()?->nama ?? null,
                'tanggal_selesai'  => $pendaftaran->tanggal_expired ?? now(),
                'qr_token'         => Sertifikat::generateQrToken(),
            ]
        );

        return Inertia::render('Peserta/sertifikat', [
            'sertifikat' => [
                'id'               => $sertifikat->id,
                'nomor_sertifikat' => $sertifikat->nomor_sertifikat,
                'nama_peserta'     => $sertifikat->nama_peserta,
                'nama_bootcamp'    => $sertifikat->nama_bootcamp,
                'nama_instruktur'  => $sertifikat->nama_instruktur,
                'tanggal_selesai'  => $sertifikat->tanggal_selesai->format('d F Y'),
                'qr_token'         => $sertifikat->qr_token,
                'verifikasi_url'   => $sertifikat->verifikasi_url,
            ],
            'peserta' => [
                'id'   => $peserta->id,
                'nama' => $peserta->nama,
            ],
        ]);
    }

    /**
     * Verifikasi sertifikat via QR code (publik)
     */
    public function verify(string $token)
    {
        $sertifikat = Sertifikat::where('qr_token', $token)->firstOrFail();

        return Inertia::render('sertifikat-verify', [
            'sertifikat' => [
                'nomor_sertifikat' => $sertifikat->nomor_sertifikat,
                'nama_peserta'     => $sertifikat->nama_peserta,
                'nama_bootcamp'    => $sertifikat->nama_bootcamp,
                'nama_instruktur'  => $sertifikat->nama_instruktur,
                'tanggal_selesai'  => $sertifikat->tanggal_selesai->format('d F Y'),
                'valid'            => true,
            ],
        ]);
    }
}