<?php

namespace App\Http\Controllers;

use App\Models\CertificateStatus;
use App\Models\OnlineClass;
use App\Services\CertificateValidationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    public function __construct(
        private CertificateValidationService $certService
    ) {}

    // ================================================================
    // PESERTA: Lihat status sertifikat saya
    // GET /api/classes/{classId}/certificate/status
    // ================================================================
    public function myStatus(int $classId): JsonResponse
    {
        $user = Auth::user();

        $certStatus = CertificateStatus::where('online_class_id', $classId)
            ->where('user_id', $user->id)
            ->with('approvedBy:id,name')
            ->first();

        // Trigger revalidasi
        if (!$certStatus || !in_array($certStatus->status, ['approved', 'manual_approved'])) {
            $certStatus = $this->certService->validateAndUpdateCertificate($classId, $user->id);
        }

        $attendanceComplete = $this->certService->checkAttendanceComplete($classId, $user->id);

        return response()->json([
            'status'             => $certStatus->status,
            'certificate_number' => $certStatus->certificate_number,
            'certificate_file'   => $certStatus->certificate_file,
            'approved_at'        => $certStatus->approved_at,
            'approved_by'        => $certStatus->approvedBy?->name,
            'approval_notes'     => $certStatus->approval_notes,
            'attendance_complete' => $attendanceComplete,
            'message'            => $this->getMessage($certStatus->status),
            'can_download'       => in_array($certStatus->status, ['approved', 'manual_approved'])
                                    && $certStatus->certificate_number,
        ]);
    }

    // ================================================================
    // PENYELENGGARA: Approve manual sertifikat peserta
    // POST /api/classes/{classId}/certificate/approve/{userId}
    // ================================================================
    public function manualApprove(Request $request, int $classId, int $userId): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        // Pastikan hanya owner kelas
        $class = OnlineClass::findOrFail($classId);
        if ($class->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $certStatus = $this->certService->manualApprove(
            classId:    $classId,
            userId:     $userId,
            approvedBy: Auth::id(),
            notes:      $request->notes ?? 'Disetujui oleh penyelenggara kelas.'
        );

        return response()->json([
            'message' => 'Sertifikat berhasil disetujui secara manual.',
            'data'    => [
                'status'             => $certStatus->status,
                'certificate_number' => $certStatus->certificate_number,
                'approved_at'        => $certStatus->approved_at,
                'approval_notes'     => $certStatus->approval_notes,
            ],
        ]);
    }

    // ================================================================
    // PENYELENGGARA: Revoke sertifikat
    // POST /api/classes/{classId}/certificate/revoke/{userId}
    // ================================================================
    public function revoke(Request $request, int $classId, int $userId): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $class = OnlineClass::findOrFail($classId);
        if ($class->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $certStatus = $this->certService->revokeCertificate(
            classId:   $classId,
            userId:    $userId,
            revokedBy: Auth::id(),
            reason:    $request->reason
        );

        return response()->json([
            'message' => 'Sertifikat berhasil dicabut.',
            'data'    => $certStatus,
        ]);
    }

    // ================================================================
    // PENYELENGGARA: List semua sertifikat di kelas
    // GET /api/classes/{classId}/certificates
    // ================================================================
    public function listForClass(int $classId): JsonResponse
    {
        $class = OnlineClass::findOrFail($classId);
        if ($class->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $certificates = CertificateStatus::where('online_class_id', $classId)
            ->with(['user:id,name,email', 'approvedBy:id,name'])
            ->get()
            ->map(fn($cert) => [
                'user_id'            => $cert->user_id,
                'user_name'          => $cert->user->name,
                'user_email'         => $cert->user->email,
                'status'             => $cert->status,
                'certificate_number' => $cert->certificate_number,
                'approved_at'        => $cert->approved_at,
                'approved_by'        => $cert->approvedBy?->name ?? 'Sistem Otomatis',
                'approval_notes'     => $cert->approval_notes,
                'attendance_complete' => $this->certService->checkAttendanceComplete($classId, $cert->user_id),
            ]);

        // Statistik
        $stats = [
            'total'          => $certificates->count(),
            'approved'       => $certificates->where('status', 'approved')->count(),
            'manual_approved'=> $certificates->where('status', 'manual_approved')->count(),
            'pending'        => $certificates->where('status', 'pending')->count(),
            'not_eligible'   => $certificates->where('status', 'not_eligible')->count(),
        ];

        return response()->json([
            'stats' => $stats,
            'data'  => $certificates,
        ]);
    }

    // ================================================================
    // PESERTA: Download sertifikat
    // GET /api/classes/{classId}/certificate/download
    // ================================================================
    public function download(int $classId)
    {
        $user = Auth::user();

        $certStatus = CertificateStatus::where('online_class_id', $classId)
            ->where('user_id', $user->id)
            ->whereIn('status', ['approved', 'manual_approved'])
            ->firstOrFail();

        if (!$certStatus->certificate_file || !Storage::disk('public')->exists($certStatus->certificate_file)) {
            // Generate sertifikat jika belum ada file-nya
            return response()->json([
                'message'            => 'Sertifikat sedang diproses.',
                'certificate_number' => $certStatus->certificate_number,
            ]);
        }

        return Storage::disk('public')->download(
            $certStatus->certificate_file,
            "Sertifikat-{$certStatus->certificate_number}.pdf"
        );
    }

    private function getMessage(string $status): string
    {
        return match ($status) {
            'approved'        => 'Selamat! Presensi Anda lengkap. Sertifikat siap diunduh.',
            'manual_approved' => 'Sertifikat Anda telah disetujui oleh penyelenggara kelas.',
            'pending'         => 'Presensi Anda belum lengkap. Hubungi penyelenggara kelas untuk mendapatkan sertifikat.',
            'rejected'        => 'Sertifikat tidak dapat diterbitkan untuk akun Anda.',
            default           => 'Lengkapi presensi (awal, tengah, akhir) untuk mendapatkan sertifikat.',
        };
    }
}