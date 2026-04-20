<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

use App\Models\User;
use App\Http\Controllers\BootcampController;
use App\Http\Controllers\SesiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BabController;
use App\Http\Controllers\MateriController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\BootcampPublicController;
use App\Http\Controllers\KustomFormController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

use App\Http\Controllers\Peserta\PesertaAuthController;
use App\Http\Controllers\Peserta\PesertaDashboardController;
use App\Http\Controllers\Peserta\PendaftaranController;
use App\Http\Controllers\Peserta\PesertaSubmissionController;
use App\Http\Controllers\Peserta\PesertaProgressController;
use App\Http\Controllers\Peserta\RatingController;
use App\Http\Controllers\Peserta\QuizController;
use App\Http\Controllers\SoalController;

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

// Link pendaftaran (link "Copy Link Pendaftaran")
Route::get('/p/{bootcamp}/bootcamp', [BootcampPublicController::class, 'show'])
    ->name('bootcamp.daftar.link');

// Ambil kustom form untuk checkout popup (fetch dari frontend)
Route::get('/bootcamps/{bootcamp}/kustom-form', [PendaftaranController::class, 'getForm'])
    ->name('peserta.kustom-form');

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
    Route::get('/dashboard',        [PesertaDashboardController::class, 'index'])->name('dashboard');
    Route::get('/kelas/{bootcamp}', [PesertaDashboardController::class, 'kelas'])->name('kelas');
    Route::post('/assignments/{assignment}/submit', [PesertaSubmissionController::class, 'store'])->name('assignment.submit');
    Route::post('/assignments/{assignment}/quiz',   [QuizController::class, 'submit'])->name('quiz.submit');
    Route::post('/bootcamp/{bootcamp}/materi/{materi}/selesai', [PesertaProgressController::class, 'tandaiMateri'])->name('materi.selesai');
    Route::post('/bootcamp/{bootcamp}/rating',  [RatingController::class, 'store'])->name('rating.store');
    Route::delete('/bootcamp/{bootcamp}/rating', [RatingController::class, 'destroy'])->name('rating.destroy');
});

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

    // Bootcamp CRUD
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
    Route::post('/bootcamps/{bootcamp}/bab/{bab}/materi',                [MateriController::class, 'store'])->name('materi.store');
    Route::put('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}',        [MateriController::class, 'update'])->name('materi.update');
    Route::delete('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}',     [MateriController::class, 'destroy'])->name('materi.destroy');

   // Assignment
    Route::post('/bootcamps/{bootcamp}/assignment',               [AssignmentController::class, 'store'])->name('assignment.store');
    Route::post('/bootcamps/{bootcamp}/assignment/{assignment}',  [AssignmentController::class, 'update'])->name('assignment.update');
    Route::put('/bootcamps/{bootcamp}/assignment/{assignment}',   [AssignmentController::class, 'update'])->name('assignment.update.put');
    Route::delete('/bootcamps/{bootcamp}/assignment/{assignment}',[AssignmentController::class, 'destroy'])->name('assignment.destroy');

    // Grade submission
    Route::post('/submissions/{submission}/grade', [GradeController::class, 'store'])->name('submission.grade');

    // Soal (quiz builder)
    Route::post('/assignments/{assignment}/soal',              [SoalController::class, 'store'])->name('soal.store');
    Route::put('/assignments/{assignment}/soal/{soal}',        [SoalController::class, 'update'])->name('soal.update');
    Route::delete('/assignments/{assignment}/soal/{soal}',     [SoalController::class, 'destroy'])->name('soal.destroy');

    // Landing Page
    Route::post('/bootcamps/{bootcamp}/landing/instruktur',  [LandingController::class, 'instruktur']);
    Route::post('/bootcamps/{bootcamp}/landing/silabus',     [LandingController::class, 'silabus']);
    Route::post('/bootcamps/{bootcamp}/landing/cocok-untuk', [LandingController::class, 'cocokUntuk']);
    Route::post('/bootcamps/{bootcamp}/landing/outcome',     [LandingController::class, 'outcome']);
    Route::post('/bootcamps/{bootcamp}/landing/faq',         [LandingController::class, 'faq']);
    Route::post('/bootcamps/{bootcamp}/landing/testimoni',   [LandingController::class, 'testimoni']);

    // Kustom Form (admin simpan config)
    Route::post('/bootcamps/{bootcamp}/kustom-form', [KustomFormController::class, 'store'])->name('kustom-form.store');
});