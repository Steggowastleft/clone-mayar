<?php

namespace App\Http\Controllers\Peserta;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\ProgressMateri;
use App\Models\Materi;
use App\Models\Bootcamp;
use App\Models\Submission;
use App\Models\Pendaftaran;
use App\Models\Sertifikat;

class PesertaProgressController extends Controller
{
    /**
     * Tandai materi sebagai sudah dibaca
     */
    public function tandaiMateri(Request $request, Bootcamp $bootcamp, Materi $materi)
    {
        $peserta = Auth::guard('peserta')->user();

        // Upsert — kalau sudah ada tidak error
        ProgressMateri::firstOrCreate([
            'peserta_id'  => $peserta->id,
            'materi_id'   => $materi->id,
            'bootcamp_id' => $bootcamp->id,
        ], [
            'dibaca_at' => now(),
        ]);

        // Hitung ulang progress
        $progress = self::hitungProgress($bootcamp, $peserta->id);

        // Update status pendaftaran jika selesai
        self::cekDanUpdateStatus($bootcamp, $peserta->id, $progress);

        return response()->json(['progress' => $progress]);
    }

    /**
     * Hitung persentase progress peserta di suatu bootcamp
     * Total item = semua materi + semua assignment
     */
    public static function hitungProgress(Bootcamp $bootcamp, int $pesertaId): int
    {
        $bootcamp->loadMissing(['babs.materis', 'assignments']);

        $totalMateri     = $bootcamp->babs->sum(fn($b) => $b->materis->count());
        $totalAssignment = $bootcamp->assignments->count();
        $totalItem       = $totalMateri + $totalAssignment;

        if ($totalItem === 0) return 0;

        $materiDibaca = ProgressMateri::where('peserta_id', $pesertaId)
            ->where('bootcamp_id', $bootcamp->id)
            ->count();

        $assignmentSubmit = Submission::where('peserta_id', $pesertaId)
            ->whereIn('assignment_id', $bootcamp->assignments->pluck('id'))
            ->count();

        $selesai = $materiDibaca + $assignmentSubmit;

        return (int) round(($selesai / $totalItem) * 100);
    }

    /**
     * Jika progress 100%, update status pendaftaran jadi 'completed'
     */
    public static function cekDanUpdateStatus(Bootcamp $bootcamp, int $pesertaId, int $progress): void
    {
        if ($progress < 100) return;

        $updated = Pendaftaran::where('registrable_id', $bootcamp->id)
            ->where('registrable_type', Bootcamp::class)
            ->where('peserta_id', $pesertaId)
            ->where('status', 'active')
            ->update([
                'status'          => 'completed',
                'tanggal_expired' => now(),
            ]);

        // Generate sertifikat otomatis
        if ($updated > 0) {
            $peserta  = \App\Models\Peserta::find($pesertaId);
            $bootcamp->loadMissing('instruktur');

            Sertifikat::firstOrCreate(
                ['peserta_id' => $pesertaId, 'bootcamp_id' => $bootcamp->id],
                [
                    'nomor_sertifikat' => Sertifikat::generateNomor(),
                    'nama_peserta'     => $peserta->nama,
                    'nama_bootcamp'    => $bootcamp->name,
                    'nama_instruktur'  => $bootcamp->instruktur()->first()?->nama ?? null,
                    'tanggal_selesai'  => now()->toDateString(),
                    'qr_token'         => Sertifikat::generateQrToken(),
                ]
            );
        }
    }
}