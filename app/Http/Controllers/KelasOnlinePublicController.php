<?php

namespace App\Http\Controllers;

use App\Models\KelasOnline;
use App\Models\KelasOnlinePeserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class KelasOnlinePublicController extends Controller
{
    public function show(string $id)
    {
        $kelas = KelasOnline::with(['owner', 'sesi'])
            ->withCount('pesertaTerdaftar')
            ->findOrFail($id);

        // Cek peserta yang sedang login
        $peserta = Auth::guard('peserta')->user();

        return Inertia::render('kelas-online/public-detail', [
            'kelas' => [
                'id'                      => $kelas->id,
                'nama'                    => $kelas->nama,
                'deskripsi'               => $kelas->deskripsi,
                'thumbnail'               => $kelas->thumbnail
                    ? asset('storage/' . $kelas->thumbnail)
                    : null,
                'harga'                   => (float) $kelas->harga,
                'is_gratis'               => $kelas->is_gratis,
                'status'                  => $kelas->status,
                'tanggal_mulai'           => $kelas->tanggal_mulai?->format('d M Y'),
                'tanggal_selesai'         => $kelas->tanggal_selesai?->format('d M Y'),
                'require_quiz_sertifikat' => $kelas->require_quiz_sertifikat,
                'nilai_minimum_quiz'      => $kelas->nilai_minimum_quiz,
                'peserta_terdaftar_count' => $kelas->peserta_terdaftar_count,
                'owner'                   => [
                    'name' => $kelas->owner->name,
                ],
                'user_id'                 => $kelas->user_id,
            ],

            'peserta' => $peserta ? [
                'id'    => $peserta->id,
                'nama'  => $peserta->nama,
                'email' => $peserta->email,
                'no_hp' => $peserta->no_hp,
            ] : null,
        ]);
    }

    public function daftar(Request $request, string $id)
    {
        $kelas   = KelasOnline::findOrFail($id);
        $peserta = Auth::guard('peserta')->user();

        // Jika tidak ada peserta login (tidak ada sesi auth), tolak
        if (!$peserta) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $validated = $request->validate([
            'no_hp' => 'nullable|string|max:20',
        ]);

        // Cek apakah sudah terdaftar
        $sudahDaftar = KelasOnlinePeserta::where('kelas_online_id', $kelas->id)
            ->where('peserta_id', $peserta->id)
            ->first();

        if ($sudahDaftar) {
            return response()->json([
                'message'  => 'Kamu sudah terdaftar di kelas ini.',
                'redirect' => '/peserta/dashboard',
            ], 409);
        }

        KelasOnlinePeserta::create([
            'kelas_online_id' => $kelas->id,
            'peserta_id'      => $peserta->id,
            'status'          => 'aktif',
            'mendaftar_pada'  => now(),
        ]);

        return response()->json([
            'message'  => 'Pendaftaran berhasil.',
            'redirect' => '/peserta/dashboard',
        ]);
    }
}
