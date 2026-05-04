<?php

namespace App\Services;

use App\Models\KelasOnline;
use App\Models\KelasOnlineSertifikat;
use App\Models\Peserta;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CertificateService
{
    public function __construct(
        private AttendanceService $attendanceService
    ) {}

    // ================================================================
    // Cek kelayakan peserta mendapat sertifikat
    // ================================================================
    public function checkEligibility(KelasOnline $kelas, Peserta $peserta): array
    {
        $missing  = [];
        $eligible = true;

        // 1. Cek presensi lengkap
        $sesiDummy = $kelas->sesi()->first(); // Ambil sesi apa saja untuk context
        if (!$sesiDummy || !$this->attendanceService->isAttendanceComplete($kelas, $peserta)) {
            $eligible = false;
            $missing[] = 'presensi_lengkap';
        }

        // 2. Cek quiz (jika wajib)
        if ($kelas->require_quiz_sertifikat) {
            // Ambil nilai tertinggi dari semua quiz di kelas ini
            $nilaiTerbaik = \DB::table('submissions')
                ->join('assignments', 'submissions.assignment_id', '=', 'assignments.id')
                ->where('assignments.kelas_online_id', $kelas->id)
                ->where('assignments.tipe', 'quiz')
                ->where('submissions.peserta_id', $peserta->id)
                ->max('submissions.grade');

            $nilaiMin = $kelas->nilai_minimum_quiz ?? 0;

            if (is_null($nilaiTerbaik) || $nilaiTerbaik < $nilaiMin) {
                $eligible = false;
                $missing[] = 'nilai_quiz_minimum';
            }
        }

        $reason = match (true) {
            $eligible => 'Peserta memenuhi semua syarat.',
            in_array('presensi_lengkap', $missing) => 'Presensi belum lengkap (awal, tengah, akhir).',
            in_array('nilai_quiz_minimum', $missing) => "Nilai quiz belum memenuhi minimum ({$kelas->nilai_minimum_quiz}).",
            default => 'Tidak memenuhi syarat.',
        };

        return compact('eligible', 'reason', 'missing');
    }

    // ================================================================
    // Buat/update sertifikat otomatis setelah presensi/quiz selesai
    // ================================================================
    public function createCertificateIfEligible(KelasOnline $kelas, Peserta $peserta): ?KelasOnlineSertifikat
    {
        $sertifikat = KelasOnlineSertifikat::firstOrCreate(
            ['kelas_online_id' => $kelas->id, 'peserta_id' => $peserta->id],
            ['status' => 'not_eligible']
        );

        // Jangan timpa manual_approved
        if ($sertifikat->status === 'manual_approved') {
            return $sertifikat;
        }

        $eligibility = $this->checkEligibility($kelas, $peserta);

        if ($eligibility['eligible']) {
            $sertifikat->update([
                'status'           => 'approved',
                'nomor_sertifikat' => $sertifikat->nomor_sertifikat ?? $this->generateNomor($kelas, $peserta),
                'approved_at'      => Carbon::now(),
                'approved_by'      => null,
                'catatan_approval' => 'Diterbitkan otomatis — presensi lengkap.',
            ]);
        } elseif (count($eligibility['missing']) > 0) {
            $newStatus = in_array('presensi_lengkap', $eligibility['missing']) ? 'pending' : 'not_eligible';
            $sertifikat->update(['status' => $newStatus]);
        }

        return $sertifikat->fresh();
    }

    // ================================================================
    // Manual approve oleh penyelenggara
    // ================================================================
    public function approveManually(
        KelasOnlineSertifikat $sertifikat,
        User   $approvedBy,
        string $catatan = ''
    ): KelasOnlineSertifikat {
        // Pastikan hanya owner kelas
        if ($sertifikat->kelasOnline->user_id !== $approvedBy->id) {
            throw new \Exception('Hanya penyelenggara kelas yang dapat memberikan approval manual.');
        }

        $sertifikat->update([
            'status'             => 'manual_approved',
            'nomor_sertifikat'   => $sertifikat->nomor_sertifikat ?? $this->generateNomor(
                $sertifikat->kelasOnline,
                $sertifikat->peserta
            ),
            'approved_by'        => $approvedBy->id,
            'is_manual_approved' => true,
            'approved_at'        => Carbon::now(),
            'catatan_approval'   => $catatan ?: 'Disetujui oleh penyelenggara kelas.',
        ]);

        return $sertifikat->fresh();
    }

    // ================================================================
    // Statistik sertifikat untuk owner
    // ================================================================
    public function getCertificateStats(KelasOnline $kelas): array
    {
        $semua = KelasOnlineSertifikat::where('kelas_online_id', $kelas->id)->get();

        return [
            'total'           => $semua->count(),
            'approved'        => $semua->where('status', 'approved')->count(),
            'manual_approved' => $semua->where('status', 'manual_approved')->count(),
            'pending'         => $semua->where('status', 'pending')->count(),
            'not_eligible'    => $semua->where('status', 'not_eligible')->count(),
            'rejected'        => $semua->where('status', 'rejected')->count(),
        ];
    }

    // ================================================================
    // List sertifikat pending untuk owner
    // ================================================================
    public function getPendingCertificates(User $owner): Collection
    {
        return KelasOnlineSertifikat::whereHas('kelasOnline', fn($q) => $q->where('user_id', $owner->id))
            ->where('status', 'pending')
            ->with(['peserta', 'kelasOnline'])
            ->get();
    }

    // ================================================================
    // Generate nomor sertifikat unik
    // Format: KO-{TAHUN}-{KELAS_ID}-{PESERTA_ID}-{RANDOM}
    // ================================================================
    private function generateNomor(KelasOnline $kelas, Peserta $peserta): string
    {
        $tahun  = Carbon::now()->year;
        $random = strtoupper(Str::random(6));
        return "KO-{$tahun}-{$kelas->id}-{$peserta->id}-{$random}";
    }
}