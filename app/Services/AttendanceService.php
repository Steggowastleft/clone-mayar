<?php

namespace App\Services;

use App\Models\KelasOnline;
use App\Models\KelasOnlineSesi;
use App\Models\KelasOnlineAttendance;
use App\Models\Peserta;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AttendanceService
{
    const TIPE_SESI = ['awal', 'tengah', 'akhir'];

    // ================================================================
    // Upload bukti presensi peserta
    // ================================================================
    public function uploadAttendance(
        KelasOnlineSesi $sesi,
        Peserta         $peserta,
        string          $tipe,
        UploadedFile    $file
    ): KelasOnlineAttendance {
        // Cek sesi aktif
        if (!$sesi->is_aktif) {
            throw new \Exception('Sesi presensi ini belum dibuka atau sudah ditutup.');
        }

        $now = now();
        $isLate = false;

        if ($sesi->batas_waktu) {
            $deadline = $sesi->batas_waktu;
            // Hitung selisih menit (now - deadline)
            $diffInMinutes = $deadline->diffInMinutes($now, false);

            if ($diffInMinutes > 10) {
                throw new \Exception("Presensi sudah berakhir. (Batas: {$deadline->format('H:i')}, Sekarang: {$now->format('H:i')})");
            }

            if ($now->isAfter($deadline)) {
                $isLate = true;
            }
        }

        // Cek duplikat
        $existing = KelasOnlineAttendance::where('sesi_id', $sesi->id)
            ->where('peserta_id', $peserta->id)
            ->first();

        if ($existing) {
            if ($existing->status === 'rejected') {
                // Jika ditolak, boleh upload ulang (hapus yang lama)
                if ($existing->file_bukti) {
                    Storage::disk('private')->delete($existing->file_bukti);
                }
                $existing->delete();
            } else {
                throw new \Exception('Anda sudah melakukan presensi untuk sesi ini.');
            }
        }

        // Simpan file ke storage private
        $path = $file->store(
            "kelas-online/{$sesi->kelas_online_id}/{$tipe}",
            'private'
        );

        return KelasOnlineAttendance::create([
            'kelas_online_id'  => $sesi->kelas_online_id,
            'sesi_id'          => $sesi->id,
            'peserta_id'       => $peserta->id,
            'attendance_type'  => $tipe,
            'file_bukti'       => $path,
            'file_nama_asli'   => $file->getClientOriginalName(),
            'status'           => 'pending', // Perlu di-approve oleh penyelenggara
            'uploaded_at'      => $now,
            'is_late'          => $isLate,
        ]);
    }

    // ================================================================
    // Approve presensi
    // ================================================================
    public function approveAttendance(KelasOnlineAttendance $attendance): void
    {
        $attendance->update(['status' => 'approved', 'keterangan' => null]);
    }

    // ================================================================
    // Reject presensi
    // ================================================================
    public function rejectAttendance(KelasOnlineAttendance $attendance, string $keterangan): void
    {
        $attendance->update(['status' => 'rejected', 'keterangan' => $keterangan]);
    }

    // ================================================================
    // Cek apakah presensi sudah lengkap (3 sesi, semua approved)
    // ================================================================
    public function isAttendanceComplete(KelasOnlineSesi|KelasOnline $context, Peserta $peserta): bool
    {
        $kelasOnlineId = $context instanceof KelasOnline
            ? $context->id
            : $context->kelas_online_id;

        // Ambil semua sesi ID untuk kelas ini
        $sesiIds = KelasOnlineSesi::where('kelas_online_id', $kelasOnlineId)
            ->whereIn('tipe', self::TIPE_SESI)
            ->pluck('id');

        if ($sesiIds->count() < 3) {
            return false; // Belum ada 3 sesi
        }

        $jumlahApproved = KelasOnlineAttendance::whereIn('sesi_id', $sesiIds)
            ->where('peserta_id', $peserta->id)
            ->where('status', 'approved')
            ->count();

        return $jumlahApproved >= 3;
    }

    // ================================================================
    // Ringkasan presensi peserta untuk 1 kelas
    // ================================================================
    public function getAttendanceSummary(KelasOnlineSesi $sesi, Peserta $peserta): array
    {
        $kelasOnlineId = $sesi->kelas_online_id;

        $semuaSesi = KelasOnlineSesi::where('kelas_online_id', $kelasOnlineId)
            ->whereIn('tipe', self::TIPE_SESI)
            ->get()
            ->keyBy('tipe');

        $semuaAttendance = KelasOnlineAttendance::where('kelas_online_id', $kelasOnlineId)
            ->where('peserta_id', $peserta->id)
            ->get()
            ->keyBy('attendance_type');

        return [
            'awal'        => $semuaAttendance->get('awal'),
            'tengah'      => $semuaAttendance->get('tengah'),
            'akhir'       => $semuaAttendance->get('akhir'),
            'is_complete' => $this->isAttendanceComplete($sesi, $peserta),
            'sesi'        => [
                'awal'   => $semuaSesi->get('awal'),
                'tengah' => $semuaSesi->get('tengah'),
                'akhir'  => $semuaSesi->get('akhir'),
            ],
        ];
    }

    // ================================================================
    // Statistik presensi untuk owner (dashboard)
    // ================================================================
    public function getAttendanceStats(KelasOnlineSesi $sesi): array
    {
        $kelasOnlineId = $sesi->kelas_online_id;

        $totalPeserta = \App\Models\KelasOnlinePeserta::where('kelas_online_id', $kelasOnlineId)
            ->where('status', 'aktif')
            ->count();

        $sesiIds = KelasOnlineSesi::where('kelas_online_id', $kelasOnlineId)->pluck('id');

        $totalApproved = KelasOnlineAttendance::whereIn('sesi_id', $sesiIds)
            ->where('status', 'approved')
            ->count();

        $totalPending = KelasOnlineAttendance::whereIn('sesi_id', $sesiIds)
            ->where('status', 'pending')
            ->count();

        return [
            'total_peserta'   => $totalPeserta,
            'total_approved'  => $totalApproved,
            'total_pending'   => $totalPending,
            'per_tipe'        => KelasOnlineAttendance::whereIn('sesi_id', $sesiIds)
                ->where('status', 'approved')
                ->selectRaw('attendance_type, count(*) as jumlah')
                ->groupBy('attendance_type')
                ->pluck('jumlah', 'attendance_type'),
        ];
    }
}