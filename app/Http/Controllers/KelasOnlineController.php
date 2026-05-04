<?php

namespace App\Http\Controllers;

use App\Models\KelasOnline;
use App\Models\Kelasonlineattendance;
use App\Models\KelasOnlineSesi;
use App\Models\KelasOnlineSertifikat;
use App\Models\KelasOnlinePeserta;
use App\Models\Peserta;
use App\Services\AttendanceService;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class KelasOnlineController extends Controller
{
    public function __construct(
        private AttendanceService  $attendanceService,
        private CertificateService $certificateService
    ) {}

    // ================================================================
    // CRUD KELAS ONLINE
    // ================================================================

    public function index(): Response
    {
        $user = auth()->user();

        $kelasOnline = KelasOnline::where('user_id', $user->id)
            ->withCount('pesertaTerdaftar')
            ->latest()
            ->paginate(12);

        return Inertia::render('kelas-online/index', [
            'produk' => $kelasOnline,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('kelas-online/index');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama'                    => 'required|string|max:255',
            'deskripsi'               => 'nullable|string',
            'harga'                   => 'required|numeric|min:0',
            'is_gratis'               => 'boolean',
            'tanggal_mulai'           => 'nullable|date',
            'tanggal_selesai'         => 'nullable|date|after_or_equal:tanggal_mulai',
            'require_quiz_sertifikat' => 'boolean',
            'nilai_minimum_quiz'      => 'nullable|numeric|min:0|max:100',
            'has_assignment'          => 'boolean',
            'thumbnail'               => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('kelas-online/thumbnails', 'public');
        }

        $kelas = KelasOnline::create([
            ...$data,
            'user_id' => auth()->id(),
            'status'  => 'draft',
        ]);

        // Auto-buat 3 sesi presensi
        foreach (['awal', 'tengah', 'akhir'] as $tipe) {
            KelasOnlineSesi::create([
                'kelas_online_id' => $kelas->id,
                'tipe'            => $tipe,
                'judul'           => match ($tipe) {
                    'awal'   => 'Presensi Awal Kelas',
                    'tengah' => 'Presensi Tengah Kelas',
                    'akhir'  => 'Presensi Akhir Kelas',
                },
                'is_aktif' => false,
            ]);
        }

        return redirect()->route('kelas-online.show', $kelas->id)
            ->with('success', 'Kelas online berhasil dibuat.');
    }

    public function show(string $id): Response
    {
        $kelas   = KelasOnline::with(['sesi', 'owner', 'babs.materis', 'instruktur', 'meetings', 'assignments.files', 'assignments.soals'])->findOrFail($id);
        $isOwner = $kelas->user_id === auth()->id();

        $assignments = $kelas->assignments->map(fn($a) => [
            'id'    => $a->id,
            'judul' => $a->judul,
        ]);

        $submissions = \App\Models\Submission::whereIn('assignment_id', $kelas->assignments->pluck('id'))
            ->with(['peserta', 'assignment'])
            ->latest('waktu_kirim')
            ->get()
            ->map(function($s) {
                return [
                    'id'               => $s->id,
                    'assignment_id'    => $s->assignment_id,
                    'assignment_judul' => $s->assignment->judul,
                    'peserta_id'       => $s->peserta_id,
                    'peserta_nama'     => $s->peserta->nama,
                    'peserta_email'    => $s->peserta->email,
                    'peserta_no_hp'    => $s->peserta->no_hp,
                    'waktu_kirim'      => $s->waktu_kirim->toISOString(),
                    'submission_url'       => $s->submission_url,
                    'submission_teks'      => $s->submission_teks,
                    'submission_file'      => $s->submission_file,
                    'submission_file_name' => $s->submission_file_name,
                    'file_url'             => $s->file_url,
                    'grade'                => $s->grade,
                ];
            });

        $pesertaList = $kelas->pesertaTerdaftar()->with('peserta')->get()->map(function($pt) {
            return [
                'id'             => $pt->peserta->id,
                'nama'           => $pt->peserta->nama,
                'email'          => $pt->peserta->email,
                'no_hp'          => $pt->peserta->no_hp,
                'status'         => $pt->status,
                'tanggal_daftar' => $pt->mendaftar_pada ? $pt->mendaftar_pada->toISOString() : $pt->created_at->toISOString(),
            ];
        });

        return Inertia::render('kelas-online/show', [
            'id'      => $id,
            'kelas'   => $kelas,
            'isOwner' => $isOwner,
            'materi'  => [
                'file' => $kelas->materi_file ? asset('storage/' . $kelas->materi_file) : null,
                'name' => $kelas->materi_nama_asli,
            ],
            'assignments' => $assignments,
            'submissions' => $submissions,
            'pesertaList' => $pesertaList,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $kelas = KelasOnline::findOrFail($id);
        $this->authorizeOwner($kelas);

        $data = $request->validate([
            'nama'                    => 'required|string|max:255',
            'deskripsi'               => 'nullable|string',
            'harga'                   => 'required|numeric|min:0',
            'is_gratis'               => 'boolean',
            'status'                  => 'in:draft,aktif,selesai,dibatalkan',
            'tanggal_mulai'           => 'nullable|date',
            'tanggal_selesai'         => 'nullable|date',
            'require_quiz_sertifikat' => 'boolean',
            'nilai_minimum_quiz'      => 'nullable|numeric|min:0|max:100',
            'has_assignment'          => 'boolean',
            'thumbnail'               => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($kelas->thumbnail) {
                Storage::disk('public')->delete($kelas->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('kelas-online/thumbnails', 'public');
        }

        $kelas->update($data);

        return redirect()->route('kelas-online.show', $kelas->id)
            ->with('success', 'Kelas berhasil diperbarui.');
    }

    public function updateStatus(Request $request, string $id)
    {
        $kelas = KelasOnline::findOrFail($id);
        $this->authorizeOwner($kelas);

        $request->validate([
            'status' => 'required|in:draft,aktif,selesai,dibatalkan',
        ]);

        $kelas->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Status kelas berhasil diperbarui.');
    }

    public function uploadMateri(Request $request, string $id)
    {
        $kelas = KelasOnline::findOrFail($id);
        $this->authorizeOwner($kelas);

        $request->validate([
            'file' => 'required|file|max:51200', // Max 50MB
        ]);

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($kelas->materi_file) {
                Storage::disk('public')->delete($kelas->materi_file);
            }

            $file = $request->file('file');
            $path = $file->store('kelas-online/materi', 'public');

            $kelas->update([
                'materi_file'      => $path,
                'materi_nama_asli' => $file->getClientOriginalName(),
            ]);
        }

        return redirect()->back()->with('success', 'Materi berhasil diunggah.');
    }

    public function destroy(string $id)
    {
        $kelas = KelasOnline::findOrFail($id);
        $this->authorizeOwner($kelas);
        $kelas->delete();

        return redirect()->route('kelas-online.index')
            ->with('success', 'Kelas berhasil dihapus.');
    }

    // ================================================================
    // PRESENSI — Peserta
    // ================================================================

    public function showAttendancePage(string $sesiId): Response
    {
        $sesi    = KelasOnlineSesi::with('kelasOnline')->findOrFail($sesiId);
        $peserta = $this->getPeserta();
        $summary = $this->attendanceService->getAttendanceSummary($sesi, $peserta);

        return Inertia::render('kelas-online/attendance', [
            'sesi'       => $sesi,
            'kelas'      => $sesi->kelasOnline,
            'attendance' => $summary,
        ]);
    }

    public function uploadAttendance(Request $request, string $sesiId): JsonResponse
    {
        $request->validate([
            'attendance_type' => 'required|in:awal,tengah,akhir',
            'file_bukti'      => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $sesi    = KelasOnlineSesi::findOrFail($sesiId);
        $peserta = $this->getPeserta();

        try {
            $attendance = $this->attendanceService->uploadAttendance(
                $sesi,
                $peserta,
                $request->attendance_type,
                $request->file('file_bukti')
            );

            $message = $attendance->is_late 
                ? 'Presensi masuk namun masih akan ditinjau lagi oleh admin karena terlambat.' 
                : 'Presensi berhasil diupload. Menunggu konfirmasi penyelenggara.';

            return response()->json([
                'success'    => true,
                'message'    => $message,
                'attendance' => $attendance,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function getAttendanceStatus(string $sesiId): JsonResponse
    {
        $sesi    = KelasOnlineSesi::findOrFail($sesiId);
        $peserta = $this->getPeserta();
        $summary = $this->attendanceService->getAttendanceSummary($sesi, $peserta);

        return response()->json([
            'complete'   => $summary['is_complete'],
            'attendance' => [
                'awal'   => $summary['awal']   ? ['status' => $summary['awal']->status]   : null,
                'tengah' => $summary['tengah'] ? ['status' => $summary['tengah']->status] : null,
                'akhir'  => $summary['akhir']  ? ['status' => $summary['akhir']->status]  : null,
            ],
        ]);
    }

    // ================================================================
    // PRESENSI MANAGEMENT — Owner
    // ================================================================

    public function manageAttendance(string $sesiId): Response
    {
        $sesi = KelasOnlineSesi::with('kelasOnline')->findOrFail($sesiId);
        $this->authorizeOwner($sesi->kelasOnline);

        $attendances = KelasOnlineAttendance::where('sesi_id', $sesiId)
            ->with('peserta')
            ->orderBy('uploaded_at', 'desc')
            ->paginate(20);

        $stats = $this->attendanceService->getAttendanceStats($sesi);

        return Inertia::render('kelas-online/manage-attendance', [
            'sesi'        => $sesi,
            'kelas'       => $sesi->kelasOnline,
            'attendances' => $attendances,
            'stats'       => $stats,
        ]);
    }

    public function approveAttendance(Request $request, string $attendanceId): JsonResponse
    {
        $attendance = KelasOnlineAttendance::with('sesi.kelasOnline')->findOrFail($attendanceId);
        $this->authorizeOwner($attendance->sesi->kelasOnline);

        try {
            $this->attendanceService->approveAttendance($attendance);

            $kelas   = $attendance->sesi->kelasOnline;
            $peserta = $attendance->peserta;

            if ($this->attendanceService->isAttendanceComplete($kelas, $peserta)) {
                $this->certificateService->createCertificateIfEligible($kelas, $peserta);
            }

            return response()->json([
                'success'    => true,
                'message'    => 'Presensi berhasil disetujui.',
                'attendance' => $attendance->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function rejectAttendance(Request $request, string $attendanceId): JsonResponse
    {
        $request->validate([
            'keterangan' => 'nullable|string|max:500',
        ]);

        $attendance = KelasOnlineAttendance::with('sesi.kelasOnline')->findOrFail($attendanceId);
        $this->authorizeOwner($attendance->sesi->kelasOnline);

        try {
            $this->attendanceService->rejectAttendance(
                $attendance,
                $request->keterangan ?? ''
            );

            return response()->json([
                'success'    => true,
                'message'    => 'Presensi ditolak.',
                'attendance' => $attendance->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function toggleSesi(Request $request, string $kelasId, string $tipe): JsonResponse
    {
        $kelas = KelasOnline::findOrFail($kelasId);
        $this->authorizeOwner($kelas);

        $sesi = KelasOnlineSesi::firstOrCreate(
            ['kelas_online_id' => $kelasId, 'tipe' => $tipe],
            [
                'judul'    => match ($tipe) {
                    'awal'   => 'Presensi Awal Kelas',
                    'tengah' => 'Presensi Tengah Kelas',
                    default  => 'Presensi Akhir Kelas',
                },
                'is_aktif' => false,
            ]
        );

        $bukaSekarang = !$sesi->is_aktif;

        $updateData = [
            'is_aktif'     => $bukaSekarang,
            'dibuka_pada'  => $bukaSekarang ? now() : $sesi->dibuka_pada,
            'ditutup_pada' => !$bukaSekarang ? now() : null,
        ];

        if ($bukaSekarang && $request->batas_waktu) {
            $updateData['batas_waktu'] = $request->batas_waktu;
        }

        $sesi->update($updateData);

        return response()->json([
            'success' => true,
            'message' => $bukaSekarang ? "Sesi {$tipe} dibuka." : "Sesi {$tipe} ditutup.",
            'sesi'    => $sesi->fresh(),
        ]);
    }

    public function downloadBukti(string $attendanceId)
    {
        $attendance = KelasOnlineAttendance::with('sesi.kelasOnline')->findOrFail($attendanceId);
        $this->authorizeOwner($attendance->sesi->kelasOnline);

        if (!Storage::disk('private')->exists($attendance->file_bukti)) {
            abort(404, 'File tidak ditemukan.');
        }

        return Storage::disk('private')->download(
            $attendance->file_bukti,
            $attendance->file_nama_asli
        );
    }

    // ================================================================
    // SERTIFIKAT — Peserta
    // ================================================================

    public function showCertificates(): Response
    {
        $peserta     = $this->getPeserta();
        $sertifikats = KelasOnlineSertifikat::where('peserta_id', $peserta->id)
            ->whereIn('status', ['approved', 'manual_approved'])
            ->with('kelasOnline')
            ->get();

        return Inertia::render('kelas-online/certificates', [
            'certificates' => $sertifikats,
        ]);
    }

    public function showCertificateDetail(string $certificateId): Response
    {
        $peserta    = $this->getPeserta();
        $sertifikat = KelasOnlineSertifikat::with(['kelasOnline.instruktur', 'peserta'])
            ->where('peserta_id', $peserta->id)
            ->findOrFail($certificateId);

        return Inertia::render('kelas-online/certificate-detail', [
            'sertifikat' => [
                'id'               => $sertifikat->id,
                'nomor_sertifikat' => $sertifikat->nomor_sertifikat,
                'nama_peserta'     => $sertifikat->peserta->nama,
                'nama_kelas'       => $sertifikat->kelasOnline->nama,
                'nama_instruktur'  => $sertifikat->kelasOnline->instruktur()->first()?->nama,
                'tanggal_selesai'  => $sertifikat->approved_at->format('d F Y'),
                'qr_token'         => $sertifikat->qr_token,
                'verifikasi_url'   => $sertifikat->verifikasi_url,
            ],
            'peserta' => [
                'id'   => $peserta->id,
                'nama' => $peserta->nama,
            ],
        ]);
    }

    public function checkCertificateStatus(string $kelasId): JsonResponse
    {
        $kelas      = KelasOnline::findOrFail($kelasId);
        $peserta    = $this->getPeserta();
        $eligibility = $this->certificateService->checkEligibility($kelas, $peserta);

        $sertifikat = KelasOnlineSertifikat::where('peserta_id', $peserta->id)
            ->where('kelas_online_id', $kelasId)
            ->first();

        return response()->json([
            'eligible'    => $eligibility['eligible'],
            'reason'      => $eligibility['reason'],
            'missing'     => $eligibility['missing'],
            'certificate' => $sertifikat ? [
                'nomor'       => $sertifikat->nomor_sertifikat,
                'status'      => $sertifikat->status,
                'is_approved' => $sertifikat->isValid(),
                'approved_at' => $sertifikat->approved_at,
                'url'         => $sertifikat->verifikasi_url,
            ] : null,
        ]);
    }

    public function verifyCertificate(string $token): Response
    {
        $sertifikat = KelasOnlineSertifikat::where('qr_token', $token)->firstOrFail();

        return Inertia::render('sertifikat-verify', [
            'sertifikat' => [
                'nomor_sertifikat' => $sertifikat->nomor_sertifikat,
                'nama_peserta'     => $sertifikat->peserta->nama,
                'nama_bootcamp'    => $sertifikat->kelasOnline->nama,
                'nama_instruktur'  => $sertifikat->kelasOnline->instruktur()->first()?->nama ?? '-',
                'tanggal_selesai'  => $sertifikat->approved_at->format('d F Y'),
                'valid'            => $sertifikat->isValid(),
            ],
        ]);
    }

    // ================================================================
    // SERTIFIKAT MANAGEMENT — Owner
    // ================================================================

    public function manageCertificates(string $kelasId): Response
    {
        $kelas = KelasOnline::findOrFail($kelasId);
        $this->authorizeOwner($kelas);

        $sertifikats = KelasOnlineSertifikat::where('kelas_online_id', $kelasId)
            ->with(['peserta', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $stats = $this->certificateService->getCertificateStats($kelas);

        return Inertia::render('kelas-online/manage-certificates', [
            'kelas'        => $kelas,
            'certificates' => $sertifikats,
            'stats'        => $stats,
        ]);
    }

    public function manualApproveCertificate(Request $request, string $certificateId): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $sertifikat = KelasOnlineSertifikat::with('kelasOnline')->findOrFail($certificateId);
        $this->authorizeOwner($sertifikat->kelasOnline);

        try {
            $this->certificateService->approveManually(
                $sertifikat,
                auth()->user(),
                $request->reason ?? ''
            );

            return response()->json([
                'success'     => true,
                'message'     => 'Sertifikat berhasil disetujui.',
                'certificate' => $sertifikat->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function getPendingCertificates(): JsonResponse
    {
        $pending = $this->certificateService->getPendingCertificates(auth()->user());

        return response()->json([
            'pending_count' => $pending->count(),
            'certificates'  => $pending->map(fn($cert) => [
                'id'      => $cert->id,
                'peserta' => $cert->peserta->nama,
                'kelas'   => $cert->kelasOnline->nama,
                'status'  => $cert->status,
            ]),
        ]);
    }
    // ================================================================
    // EXPORT
    // ================================================================

    public function exportAttendance(string $sesiId)
    {
        $sesi = KelasOnlineSesi::with('kelasOnline')->findOrFail($sesiId);
        $this->authorizeOwner($sesi->kelasOnline);

        $attendances = Kelasonlineattendance::where('sesi_id', $sesiId)
            ->with('peserta')
            ->get();

        $filename = "presensi_{$sesiId}_" . now()->format('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () use ($attendances) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Peserta', 'Tipe Presensi', 'Status', 'Tanggal Upload', 'Keterangan']);
            foreach ($attendances as $att) {
                fputcsv($file, [
                    $att->peserta->nama,
                    ucfirst($att->attendance_type),
                    ucfirst($att->status),
                    $att->uploaded_at?->format('Y-m-d H:i:s'),
                    $att->keterangan ?? '-',
                ]);
            }
            fclose($file);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function exportCertificates(string $kelasId)
    {
        $kelas = KelasOnline::findOrFail($kelasId);
        $this->authorizeOwner($kelas);

        $sertifikats = KelasOnlineSertifikat::where('kelas_online_id', $kelasId)
            ->whereIn('status', ['approved', 'manual_approved'])
            ->with(['peserta', 'approvedBy'])
            ->get();

        $filename = "sertifikat_{$kelasId}_" . now()->format('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () use ($sertifikats) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Nomor Sertifikat', 'Nama Peserta', 'Tanggal Disetujui', 'Tipe Approval', 'Disetujui Oleh']);
            foreach ($sertifikats as $cert) {
                fputcsv($file, [
                    $cert->nomor_sertifikat,
                    $cert->peserta->nama,
                    $cert->approved_at?->format('Y-m-d'),
                    $cert->is_manual_approved ? 'Manual' : 'Otomatis',
                    $cert->approvedBy?->name ?? 'Sistem',
                ]);
            }
            fclose($file);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    // ================================================================
    // INSTRUKTUR MANAGEMENT
    // ================================================================

    public function storeInstruktur(Request $request, $kelasId)
    {
        $kelas = KelasOnline::findOrFail($kelasId);
        $this->authorizeOwner($kelas);

        $request->validate([
            'nama'    => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'bio'     => 'nullable|string',
            'foto'    => 'nullable|image|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('kelas-online/instruktur', 'public');
        }

        $urutan = $kelas->instruktur()->max('urutan') + 1;

        $kelas->instruktur()->create([
            'nama'    => $request->nama,
            'jabatan' => $request->jabatan,
            'bio'     => $request->bio,
            'foto'    => $fotoPath,
            'urutan'  => $urutan,
        ]);

        return redirect()->back()->with('success', 'Instruktur berhasil ditambahkan.');
    }

    public function updateInstruktur(Request $request, $kelasId, $instrukturId)
    {
        $kelas = KelasOnline::findOrFail($kelasId);
        $this->authorizeOwner($kelas);

        $instruktur = \App\Models\Instruktur::findOrFail($instrukturId);
        abort_if($instruktur->kelas_online_id != $kelasId, 403);

        $request->validate([
            'nama'    => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'bio'     => 'nullable|string',
            'foto'    => 'nullable|image|max:2048',
        ]);

        $data = [
            'nama'    => $request->nama,
            'jabatan' => $request->jabatan,
            'bio'     => $request->bio,
        ];

        if ($request->hasFile('foto')) {
            if ($instruktur->foto) {
                Storage::disk('public')->delete($instruktur->foto);
            }
            $data['foto'] = $request->file('foto')->store('kelas-online/instruktur', 'public');
        }

        $instruktur->update($data);

        return redirect()->back()->with('success', 'Instruktur berhasil diperbarui.');
    }

    public function destroyInstruktur($kelasId, $instrukturId)
    {
        $kelas = KelasOnline::findOrFail($kelasId);
        $this->authorizeOwner($kelas);

        $instruktur = \App\Models\Instruktur::findOrFail($instrukturId);
        abort_if($instruktur->kelas_online_id != $kelasId, 403);

        if ($instruktur->foto) {
            Storage::disk('public')->delete($instruktur->foto);
        }

        $instruktur->delete();

        return redirect()->back()->with('success', 'Instruktur berhasil dihapus.');
    }

    // ================================================================
    // HELPERS
    // ================================================================

    private function authorizeOwner(KelasOnline $kelas): void
    {
        if ($kelas->user_id !== auth()->id()) {
            abort(403, 'Hanya penyelenggara kelas yang dapat melakukan tindakan ini.');
        }
    }

    private function getPeserta(): Peserta
    {
        $peserta = auth()->guard('peserta')->user();
        if (!$peserta) {
            abort(401, 'Peserta tidak terautentikasi.');
        }
        return $peserta;
    }
}