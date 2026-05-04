<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

use App\Models\User;
use App\Http\Controllers\BootcampController;
use App\Http\Controllers\SesiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KelasOnlineController;
use App\Http\Controllers\BabController;
use App\Http\Controllers\MateriController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\BootcampPublicController;
use App\Http\Controllers\KelasOnlinePublicController;
use App\Http\Controllers\KustomFormController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\KelasOnlineMeetingController;
use App\Http\Controllers\BootcampCatalogController;

use App\Http\Controllers\Peserta\PesertaAuthController;
use App\Http\Controllers\Peserta\PesertaDashboardController;
use App\Http\Controllers\Peserta\PendaftaranController;
use App\Http\Controllers\Peserta\PesertaSubmissionController;
use App\Http\Controllers\Peserta\PesertaProgressController;
use App\Http\Controllers\Peserta\RatingController;
use App\Http\Controllers\Peserta\SertifikatController;
use App\Http\Controllers\Peserta\QuizController;
use App\Http\Controllers\SoalController;
use App\Http\Controllers\PembayaranController;

// ══════════════════════════════════════════════════════════════
// PUBLIK — tidak perlu login apapun
// ══════════════════════════════════════════════════════════════

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Halaman publik bootcamp (link "Copy Halaman Kelas")
Route::get('/bootcamp/{bootcamp}', [BootcampPublicController::class, 'show'])
    ->name('bootcamp.public');

Route::get('/kelas-online/sertifikat/verify/{token}', [KelasOnlineController::class, 'verifyCertificate'])->name('kelas-online.sertifikat.verify');

// Link pendaftaran (link "Copy Link Pendaftaran")
Route::get('/p/{bootcamp}/bootcamp', [BootcampPublicController::class, 'show'])
    ->name('bootcamp.daftar.link');

// Ambil kustom form untuk checkout popup (fetch dari frontend)
Route::get('/bootcamps/{bootcamp}/kustom-form', [PendaftaranController::class, 'getForm'])
    ->name('peserta.kustom-form');

// Upload bukti transfer (publik — peserta belum punya akun)
Route::post('/pembayaran/upload-bukti', [PembayaranController::class, 'uploadBukti']);

// Verifikasi sertifikat bootcamp (publik)
Route::get('/sertifikat/verify/{token}', [SertifikatController::class, 'verify'])
    ->name('sertifikat.verify');

// Verifikasi sertifikat kelas online (publik)
Route::get('/kelas-online/sertifikat/verify/{qr_token}', [KelasOnlineController::class, 'verifyCertificate'])
    ->name('kelas-online.sertifikat.public-verify');

// Halaman publik kelas online (share link untuk pendaftaran peserta)
Route::get('/kelas-online/{id}', [KelasOnlinePublicController::class, 'show'])
    ->name('kelas-online.public');
Route::post('/kelas-online/{id}/daftar', [KelasOnlinePublicController::class, 'daftar'])
    ->name('kelas-online.daftar');

// ══════════════════════════════════════════════════════════════
// AUTH ADMIN
// ══════════════════════════════════════════════════════════════

Route::get('/register', function () {
    return Inertia::render('Auth/Register');
})->name('register');

Route::post('/register', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'required|email|unique:users,email',
        'password' => 'required|string|confirmed|min:8',
    ]);
    User::create([
        'name'     => $request->name,
        'email'    => $request->email,
        'password' => Hash::make($request->password),
    ]);
    return redirect()->route('login');
});

Route::get('/login',   [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login',  [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

// ══════════════════════════════════════════════════════════════
// AUTH PESERTA
// ══════════════════════════════════════════════════════════════

// Endpoint checkout (dipanggil via fetch dari CheckoutDialog — tidak perlu guard)
Route::post('/peserta/check-email',       [PesertaAuthController::class, 'checkEmail']);
Route::post('/peserta/login-checkout',    [PesertaAuthController::class, 'loginCheckout']);
Route::post('/peserta/register-checkout', [PesertaAuthController::class, 'registerCheckout']);

// Halaman login terpisah (untuk akses dashboard langsung)
Route::middleware('guest.peserta')->group(function () {
    Route::get('/peserta/login',  [PesertaAuthController::class, 'showLogin'])->name('peserta.login');
    Route::post('/peserta/login', [PesertaAuthController::class, 'login']);
});

// Logout peserta
Route::post('/peserta/logout', [PesertaAuthController::class, 'logout'])
    ->name('peserta.logout');

// ══════════════════════════════════════════════════════════════
// DASHBOARD PESERTA — harus login sebagai peserta
// ══════════════════════════════════════════════════════════════

Route::middleware('auth.peserta')->prefix('peserta')->name('peserta.')->group(function () {

    // Dashboard & Kelas Bootcamp
    Route::get('/dashboard',        [PesertaDashboardController::class, 'index'])->name('dashboard');
    Route::get('/kelas/{bootcamp}', [PesertaDashboardController::class, 'kelas'])->name('kelas');
    // KELAS ONLINE — Sertifikat (Peserta)
    Route::get('/kelas-online/sertifikat',                           [KelasOnlineController::class, 'showCertificates'])->name('kelas-online.sertifikat.index');
    Route::get('/kelas-online/sertifikat/{certificate}',             [KelasOnlineController::class, 'showCertificateDetail'])->name('kelas-online.sertifikat.show');

    Route::get('/kelas-online/{id}', [PesertaDashboardController::class, 'kelasOnline'])->name('kelas-online');

    // Assignment & Quiz Bootcamp
    Route::post('/assignments/{assignment}/submit', [PesertaSubmissionController::class, 'store'])->name('assignment.submit');
    Route::post('/assignments/{assignment}/quiz',   [QuizController::class, 'submit'])->name('quiz.submit');

    // Progress & Rating Bootcamp
    Route::post('/bootcamp/{bootcamp}/materi/{materi}/selesai', [PesertaProgressController::class, 'tandaiMateri'])->name('materi.selesai');
    Route::post('/bootcamp/{bootcamp}/rating',   [RatingController::class, 'store'])->name('rating.store');
    Route::delete('/bootcamp/{bootcamp}/rating', [RatingController::class, 'destroy'])->name('rating.destroy');

    // Sertifikat Bootcamp
    Route::get('/bootcamp/{bootcamp}/sertifikat', [SertifikatController::class, 'show'])->name('sertifikat.show');

    // ----------------------------------------------------------
    // KELAS ONLINE — Presensi (Peserta)
    // ----------------------------------------------------------
    Route::get('/sesi/{sesi}/attendance',          [KelasOnlineController::class, 'showAttendancePage'])->name('kelas-online.attendance.page');
    Route::post('/sesi/{sesi}/attendance/upload',  [KelasOnlineController::class, 'uploadAttendance'])->name('kelas-online.attendance.upload');
    Route::get('/sesi/{sesi}/attendance/status',   [KelasOnlineController::class, 'getAttendanceStatus'])->name('kelas-online.attendance.status');

    Route::get('/kelas-online/{kelasOnline}/sertifikat/check',       [KelasOnlineController::class, 'checkCertificateStatus'])->name('kelas-online.sertifikat.check');
});

// Pendaftaran bootcamp (peserta terautentikasi)
Route::middleware('auth.peserta')
    ->post('/bootcamps/{bootcamp}/daftar', [PendaftaranController::class, 'daftar'])
    ->name('peserta.daftar');

// ══════════════════════════════════════════════════════════════
// ADMIN — semua harus login sebagai admin
// ══════════════════════════════════════════════════════════════

Route::middleware('auth')->group(function () {

    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/dashboard', function () {
        return redirect()->route('bootcamps.index');
    })->name('dashboard');

    // ----------------------------------------------------------
    // BOOTCAMP
    // ----------------------------------------------------------

    Route::get('/bootcamps/katalog', [BootcampCatalogController::class, 'index'])
        ->name('bootcamps.katalog');

    // CRUD
    Route::get('/bootcamps',                       [BootcampController::class, 'index'])->name('bootcamps.index');
    Route::post('/bootcamps',                      [BootcampController::class, 'store'])->name('bootcamps.store');
    Route::get('/bootcamps/{bootcamp}',            [BootcampController::class, 'show'])->name('bootcamps.show');
    Route::put('/bootcamps/{bootcamp}',            [BootcampController::class, 'update'])->name('bootcamps.update');
    Route::patch('/bootcamps/{bootcamp}/status',   [BootcampController::class, 'updateStatus'])->name('bootcamps.status');
    Route::post('/bootcamps/{bootcamp}/duplicate', [BootcampController::class, 'duplicate'])->name('bootcamps.duplicate');
    Route::delete('/bootcamps/{bootcamp}',         [BootcampController::class, 'destroy'])->name('bootcamps.destroy');

    // Sesi Meeting
    Route::post('/bootcamps/{bootcamp}/sesi',          [SesiController::class, 'store'])->name('sesi.store');
    Route::put('/bootcamps/{bootcamp}/sesi/{sesi}',    [SesiController::class, 'update'])->name('sesi.update');
    Route::delete('/bootcamps/{bootcamp}/sesi/{sesi}', [SesiController::class, 'destroy'])->name('sesi.destroy');

    // Bab
    Route::post('/bootcamps/{bootcamp}/bab',         [BabController::class, 'store'])->name('bab.store');
    Route::put('/bootcamps/{bootcamp}/bab/{bab}',    [BabController::class, 'update'])->name('bab.update');
    Route::delete('/bootcamps/{bootcamp}/bab/{bab}', [BabController::class, 'destroy'])->name('bab.destroy');

    // Materi
    Route::post('/bootcamps/{bootcamp}/bab/{bab}/materi',              [MateriController::class, 'store'])->name('materi.store');
    Route::put('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}',      [MateriController::class, 'update'])->name('materi.update');
    Route::delete('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}',   [MateriController::class, 'destroy'])->name('materi.destroy');

    // Assignment
    Route::post('/bootcamps/{bootcamp}/assignment',               [AssignmentController::class, 'store'])->name('assignment.store');
    Route::post('/bootcamps/{bootcamp}/assignment/{assignment}',  [AssignmentController::class, 'update'])->name('assignment.update');
    Route::delete('/bootcamps/{bootcamp}/assignment/{assignment}',[AssignmentController::class, 'destroy'])->name('assignment.destroy');

    // Grade submission
    Route::post('/submissions/{submission}/grade', [GradeController::class, 'store'])->name('submission.grade');

    // Soal (quiz builder)
    Route::post('/assignments/{assignment}/soal',          [SoalController::class, 'store'])->name('soal.store');
    Route::put('/assignments/{assignment}/soal/{soal}',    [SoalController::class, 'update'])->name('soal.update');
    Route::delete('/assignments/{assignment}/soal/{soal}', [SoalController::class, 'destroy'])->name('soal.destroy');

    // Landing Page
    Route::post('/bootcamps/{bootcamp}/landing/instruktur',  [LandingController::class, 'instruktur']);
    Route::post('/bootcamps/{bootcamp}/landing/silabus',     [LandingController::class, 'silabus']);
    Route::post('/bootcamps/{bootcamp}/landing/cocok-untuk', [LandingController::class, 'cocokUntuk']);
    Route::post('/bootcamps/{bootcamp}/landing/outcome',     [LandingController::class, 'outcome']);
    Route::post('/bootcamps/{bootcamp}/landing/faq',         [LandingController::class, 'faq']);
    Route::post('/bootcamps/{bootcamp}/landing/testimoni',   [LandingController::class, 'testimoni']);

    // Pembayaran manual
    Route::post('/pembayaran/{pembayaran}/confirm', [PembayaranController::class, 'confirm'])->name('pembayaran.confirm');
    Route::post('/pembayaran/{pembayaran}/reject',  [PembayaranController::class, 'reject'])->name('pembayaran.reject');

    // Kustom Form
    Route::post('/bootcamps/{bootcamp}/kustom-form', [KustomFormController::class, 'store'])->name('kustom-form.store');

    // ----------------------------------------------------------
    // KELAS ONLINE — CRUD (Admin/Penyelenggara)
    // ----------------------------------------------------------

    Route::prefix('kelas-online')->name('kelas-online.')->group(function () {

        // Index & CRUD
        Route::get('/',                [KelasOnlineController::class, 'index'])->name('index');
        Route::post('/',               [KelasOnlineController::class, 'store'])->name('store');
        Route::get('/{id}/manage',     [KelasOnlineController::class, 'show'])->name('show');
        Route::post('/{id}',            [KelasOnlineController::class, 'update'])->name('update');
        Route::post('/{id}/upload-materi', [KelasOnlineController::class, 'uploadMateri'])->name('upload-materi');
        Route::patch('/{id}/status',   [KelasOnlineController::class, 'updateStatus'])->name('status');
        Route::delete('/{id}',         [KelasOnlineController::class, 'destroy'])->name('destroy');

        // Sesi Meeting / Zoom
        Route::post('/{kelas_online}/meetings', [KelasOnlineMeetingController::class, 'store'])->name('meetings.store');
        Route::put('/{kelas_online}/meetings/{id}', [KelasOnlineMeetingController::class, 'update'])->name('meetings.update');
        Route::delete('/{kelas_online}/meetings/{id}', [KelasOnlineMeetingController::class, 'destroy'])->name('meetings.destroy');

        // Presensi — kelola (Penyelenggara)
        Route::get('/sesi/{sesi}/attendance/manage',       [KelasOnlineController::class, 'manageAttendance'])->name('attendance.manage');
        Route::post('/attendance/{attendance}/approve',    [KelasOnlineController::class, 'approveAttendance'])->name('attendance.approve');
        Route::post('/attendance/{attendance}/reject',     [KelasOnlineController::class, 'rejectAttendance'])->name('attendance.reject');
        Route::get('/attendance/{sesi}/export',            [KelasOnlineController::class, 'exportAttendance'])->name('attendance.export');
        Route::get('/attendance/{attendance}/bukti',       [KelasOnlineController::class, 'downloadBukti'])->name('attendance.bukti');

        // Toggle buka/tutup sesi presensi
        Route::patch('/{kelasId}/sesi/{tipe}/toggle',      [KelasOnlineController::class, 'toggleSesi'])->name('sesi.toggle');

        // Sertifikat — kelola (Penyelenggara)
        Route::get('/{kelasId}/sertifikat/manage',                     [KelasOnlineController::class, 'manageCertificates'])->name('sertifikat.manage');
        Route::post('/sertifikat/{certificate}/approve-manual',        [KelasOnlineController::class, 'manualApproveCertificate'])->name('sertifikat.approve-manual');
        Route::get('/sertifikat/pending',                              [KelasOnlineController::class, 'getPendingCertificates'])->name('sertifikat.pending');
        Route::get('/sertifikat/export/{kelasId}',                     [KelasOnlineController::class, 'exportCertificates'])->name('sertifikat.export');

        // Bab (Section) for Kelas Online
        Route::post('/{kelasId}/bab',                      [BabController::class, 'storeForKelasOnline'])->name('bab.store');
        Route::put('/{kelasId}/bab/{bab}',                 [BabController::class, 'updateForKelasOnline'])->name('bab.update');
        Route::delete('/{kelasId}/bab/{bab}',              [BabController::class, 'destroyForKelasOnline'])->name('bab.destroy');

        // Materi for Kelas Online
        Route::post('/{kelasId}/bab/{bab}/materi',              [MateriController::class, 'storeForKelasOnline'])->name('materi.store');
        Route::put('/{kelasId}/bab/{bab}/materi/{materi}',      [MateriController::class, 'updateForKelasOnline'])->name('materi.update');
        Route::delete('/{kelasId}/bab/{bab}/materi/{materi}',   [MateriController::class, 'destroyForKelasOnline'])->name('materi.destroy');

        // Assignment for Kelas Online
        Route::post('/{kelasId}/assignment',                    [AssignmentController::class, 'storeForKelasOnline'])->name('assignment.store');
        Route::post('/{kelasId}/assignment/{assignment}',       [AssignmentController::class, 'updateForKelasOnline'])->name('assignment.update');
        Route::delete('/{kelasId}/assignment/{assignment}',     [AssignmentController::class, 'destroyForKelasOnline'])->name('assignment.destroy');

        // Instruktur for Kelas Online
        Route::post('/{kelasId}/instruktur',                     [KelasOnlineController::class, 'storeInstruktur'])->name('instruktur.store');
        Route::post('/{kelasId}/instruktur/{instruktur}',        [KelasOnlineController::class, 'updateInstruktur'])->name('instruktur.update'); // Using POST for update to handle file upload easily
        Route::delete('/{kelasId}/instruktur/{instruktur}',      [KelasOnlineController::class, 'destroyInstruktur'])->name('instruktur.destroy');
    });
});