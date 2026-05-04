<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\OnlineClass;
use App\Services\CertificateValidationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        private CertificateValidationService $certService
    ) {}

    // ================================================================
    // PESERTA: Upload bukti presensi
    // POST /api/classes/{classId}/attendance
    // ================================================================
    public function submit(Request $request, int $classId): JsonResponse
    {
        $request->validate([
            'session_type' => 'required|in:opening,middle,closing',
            'proof_file'   => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // Max 5MB
            'notes'        => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        // Pastikan peserta terdaftar di kelas
        $enrollment = $user->classEnrollments()
            ->where('online_class_id', $classId)
            ->where('status', 'enrolled')
            ->firstOrFail();

        // Ambil sesi presensi
        $session = AttendanceSession::where('online_class_id', $classId)
            ->where('session_type', $request->session_type)
            ->where('is_active', true)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Sesi presensi ini belum dibuka atau sudah ditutup.',
            ], 422);
        }

        // Cek batas waktu sesi
        if ($session->close_at && now()->isAfter($session->close_at)) {
            return response()->json([
                'message' => 'Sesi presensi sudah ditutup.',
            ], 422);
        }

        // Cek apakah sudah pernah presensi di sesi ini
        $existing = Attendance::where('attendance_session_id', $session->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah melakukan presensi untuk sesi ini.',
                'data'    => $existing,
            ], 409);
        }

        // Upload file bukti
        $file = $request->file('proof_file');
        $path = $file->store("attendance/{$classId}/{$session->session_type}", 'private');

        // Simpan presensi
        $attendance = Attendance::create([
            'attendance_session_id' => $session->id,
            'user_id'               => $user->id,
            'online_class_id'       => $classId,
            'proof_file'            => $path,
            'proof_original_name'   => $file->getClientOriginalName(),
            'status'                => 'approved', // Auto-approve saat upload (bisa diubah ke pending jika perlu review)
            'notes'                 => $request->notes,
            'submitted_at'          => now(),
        ]);

        // Trigger validasi sertifikat
        $certStatus = $this->certService->validateAndUpdateCertificate($classId, $user->id);

        return response()->json([
            'message'     => 'Presensi berhasil disimpan.',
            'data'        => $attendance,
            'certificate' => [
                'status' => $certStatus->status,
                'message' => $this->getCertificateMessage($certStatus->status),
            ],
        ], 201);
    }

    // ================================================================
    // PESERTA: Lihat status presensi saya
    // GET /api/classes/{classId}/attendance/my-status
    // ================================================================
    public function myStatus(int $classId): JsonResponse
    {
        $user = Auth::user();

        $sessions = AttendanceSession::where('online_class_id', $classId)
            ->whereIn('session_type', ['opening', 'middle', 'closing'])
            ->with(['attendances' => fn($q) => $q->where('user_id', $user->id)])
            ->get();

        $result = $sessions->map(fn($session) => [
            'session_type' => $session->session_type,
            'title'        => $session->title,
            'is_active'    => $session->is_active,
            'open_at'      => $session->open_at,
            'close_at'     => $session->close_at,
            'attendance'   => $session->attendances->first() ? [
                'status'       => $session->attendances->first()->status,
                'submitted_at' => $session->attendances->first()->submitted_at,
                'proof_file'   => $session->attendances->first()->proof_file,
            ] : null,
        ]);

        $certStatus = \App\Models\CertificateStatus::where('online_class_id', $classId)
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'sessions'    => $result,
            'certificate' => [
                'status'             => $certStatus?->status ?? 'not_eligible',
                'certificate_number' => $certStatus?->certificate_number,
                'message'            => $this->getCertificateMessage($certStatus?->status ?? 'not_eligible'),
            ],
        ]);
    }

    // ================================================================
    // PENYELENGGARA: Buka/tutup sesi presensi
    // PATCH /api/classes/{classId}/sessions/{sessionType}/toggle
    // ================================================================
    public function toggleSession(Request $request, int $classId, string $sessionType): JsonResponse
    {
        $this->authorizeOwner($classId);

        $session = AttendanceSession::firstOrCreate(
            ['online_class_id' => $classId, 'session_type' => $sessionType],
            [
                'title'     => $this->getSessionTitle($sessionType),
                'is_active' => false,
            ]
        );

        $isOpening = !$session->is_active;

        $session->update([
            'is_active' => $isOpening,
            'open_at'   => $isOpening ? now() : $session->open_at,
            'close_at'  => !$isOpening ? now() : null,
        ]);

        return response()->json([
            'message'   => $isOpening ? "Sesi {$sessionType} dibuka." : "Sesi {$sessionType} ditutup.",
            'session'   => $session->fresh(),
        ]);
    }

    // ================================================================
    // PENYELENGGARA: Lihat semua presensi peserta
    // GET /api/classes/{classId}/attendance/summary
    // ================================================================
    public function summary(int $classId): JsonResponse
    {
        $this->authorizeOwner($classId);

        $summary = $this->certService->getParticipantsSummary($classId);

        return response()->json(['data' => $summary]);
    }

    // ================================================================
    // PENYELENGGARA: Download bukti presensi
    // GET /api/classes/{classId}/attendance/{attendanceId}/proof
    // ================================================================
    public function downloadProof(int $classId, int $attendanceId)
    {
        $this->authorizeOwner($classId);

        $attendance = Attendance::where('online_class_id', $classId)
            ->findOrFail($attendanceId);

        if (!Storage::disk('private')->exists($attendance->proof_file)) {
            abort(404, 'File bukti tidak ditemukan.');
        }

        return Storage::disk('private')->download(
            $attendance->proof_file,
            $attendance->proof_original_name
        );
    }

    // ================================================================
    // HELPER
    // ================================================================
    private function authorizeOwner(int $classId): void
    {
        $class = OnlineClass::findOrFail($classId);
        if ($class->owner_id !== Auth::id()) {
            abort(403, 'Hanya penyelenggara kelas yang dapat melakukan tindakan ini.');
        }
    }

    private function getSessionTitle(string $type): string
    {
        return match ($type) {
            'opening' => 'Presensi Awal Kelas',
            'middle'  => 'Presensi Tengah Kelas',
            'closing' => 'Presensi Akhir Kelas',
            default   => 'Presensi',
        };
    }

    private function getCertificateMessage(string $status): string
    {
        return match ($status) {
            'approved'        => '🎉 Selamat! Sertifikat Anda siap diunduh.',
            'manual_approved' => '🎉 Sertifikat Anda telah disetujui oleh penyelenggara.',
            'pending'         => '⏳ Presensi belum lengkap. Hubungi penyelenggara kelas jika ada kendala.',
            'rejected'        => '❌ Sertifikat tidak dapat diterbitkan.',
            default           => '📋 Lengkapi presensi untuk mendapatkan sertifikat.',
        };
    }
}