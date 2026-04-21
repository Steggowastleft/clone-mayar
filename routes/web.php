<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

use App\Models\User;

// Controllers — Admin Dashboard
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\ProdukDigitalController;
use App\Http\Controllers\WebinarController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\BundleController;
use App\Http\Controllers\LinkPembayaranController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\AffiliasiController;
use App\Http\Controllers\AnalitikController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\BerlanggananController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PermintaanBayarController;
use App\Http\Controllers\SemuaProdukController;
use App\Http\Controllers\ProdukFisikController;
use App\Http\Controllers\KelasOnlineController;
use App\Http\Controllers\CoachingMentoringController;
use App\Http\Controllers\PenggalanganDanaController;
use App\Http\Controllers\PaketBerlanggananController;
use App\Http\Controllers\EbookController;
use App\Http\Controllers\PodcastController;
use App\Http\Controllers\AudioBookController;
use App\Http\Controllers\TulisanController;
use App\Http\Controllers\WebKomikController;
use App\Http\Controllers\CreatorSupportPageController;
use App\Http\Controllers\MembershipSaasController;

// Controllers — Bootcamp
use App\Http\Controllers\BootcampController;
use App\Http\Controllers\SesiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BabController;
use App\Http\Controllers\MateriController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\BootcampPublicController;
use App\Http\Controllers\KustomFormController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Controllers — Peserta
use App\Http\Controllers\Peserta\PesertaAuthController;
use App\Http\Controllers\Peserta\PesertaDashboardController;
use App\Http\Controllers\Peserta\PendaftaranController;
use App\Http\Controllers\Peserta\PesertaSubmissionController;
use App\Http\Controllers\Peserta\PesertaProgressController;
use App\Http\Controllers\Peserta\RatingController;
use App\Http\Controllers\Peserta\QuizController;
use App\Http\Controllers\Peserta\SertifikatController;
use App\Http\Controllers\SoalController;

// Controllers — Pembayaran & Katalog
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\BootcampCatalogController;

// ══════════════════════════════════════════════════════════════
// PUBLIK — tidak perlu login
// ══════════════════════════════════════════════════════════════

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Halaman publik bootcamp
Route::get('/bootcamp/{bootcamp}', [BootcampPublicController::class, 'show'])
    ->name('bootcamp.public');

Route::get('/p/{bootcamp}/bootcamp', [BootcampPublicController::class, 'show'])
    ->name('bootcamp.daftar.link');

// Kustom form checkout (fetch dari frontend)
Route::get('/bootcamps/{bootcamp}/kustom-form', [PendaftaranController::class, 'getForm'])
    ->name('peserta.kustom-form');

// Katalog bootcamp
Route::get('/bootcamp-catalog', [BootcampCatalogController::class, 'index'])
    ->name('bootcamp.catalog');

// Pembayaran (upload bukti transfer - publik)
Route::post('/pembayaran/upload-bukti', [PembayaranController::class, 'uploadBukti'])
    ->name('pembayaran.upload-bukti');

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

Route::middleware('guest:peserta')->prefix('peserta')->name('peserta.')->group(function () {
    Route::get('/login',     [PesertaAuthController::class, 'showLogin'])->name('login');
    Route::post('/login',    [PesertaAuthController::class, 'login']);
    Route::get('/register',  [PesertaAuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [PesertaAuthController::class, 'register']);
});

Route::post('/peserta/logout', [PesertaAuthController::class, 'logout'])
    ->name('peserta.logout');

// ══════════════════════════════════════════════════════════════
// DASHBOARD PESERTA
// ══════════════════════════════════════════════════════════════

Route::middleware('auth.peserta')->prefix('peserta')->name('peserta.')->group(function () {
    Route::get('/dashboard',        [PesertaDashboardController::class, 'index'])->name('dashboard');
    Route::get('/kelas/{bootcamp}', [PesertaDashboardController::class, 'kelas'])->name('kelas');
    Route::post('/assignments/{assignment}/submit', [PesertaSubmissionController::class, 'store'])->name('assignment.submit');
    Route::post('/assignments/{assignment}/quiz',   [QuizController::class, 'submit'])->name('quiz.submit');
    Route::post('/bootcamp/{bootcamp}/materi/{materi}/selesai', [PesertaProgressController::class, 'tandaiMateri'])->name('materi.selesai');
    Route::post('/bootcamp/{bootcamp}/rating',  [RatingController::class, 'store'])->name('rating.store');
    Route::delete('/bootcamp/{bootcamp}/rating', [RatingController::class, 'destroy'])->name('rating.destroy');
    Route::get('/bootcamp/{bootcamp}/sertifikat', [SertifikatController::class, 'show'])->name('sertifikat.show');
});

Route::middleware('auth.peserta')
    ->post('/bootcamps/{bootcamp}/daftar', [PendaftaranController::class, 'daftar'])
    ->name('peserta.daftar');

// ══════════════════════════════════════════════════════════════
// ADMIN — semua harus login
// ══════════════════════════════════════════════════════════════

Route::middleware('auth')->group(function () {

    // ── Profile ──────────────────────────────────────────────
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ── Dashboard ─────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Transaksi ─────────────────────────────────────────────
    Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi.index');

    // ── Produk Digital ────────────────────────────────────────
    Route::get('/produk-digital', [ProdukDigitalController::class, 'index'])->name('produk-digital.index');

    // ── Webinar ───────────────────────────────────────────────
    Route::get('/webinar', [WebinarController::class, 'index'])->name('webinar.index');

    // ── Event ─────────────────────────────────────────────────
    Route::get('/event', [EventController::class, 'index'])->name('event.index');

    // ── Bundle ────────────────────────────────────────────────
    Route::get('/bundle', [BundleController::class, 'index'])->name('bundle.index');

    // ── Link Pembayaran ───────────────────────────────────────
    Route::get('/link-pembayaran', [LinkPembayaranController::class, 'index'])->name('link-pembayaran.index');

    // ── Pelanggan ─────────────────────────────────────────────
    Route::get('/pelanggan', [PelangganController::class, 'index'])->name('pelanggan.index');

    // ── Affiliasi ─────────────────────────────────────────────
    Route::get('/affiliasi', [AffiliasiController::class, 'index'])->name('affiliasi.index');

    // ── Analitik ──────────────────────────────────────────────
    Route::get('/analitik', [AnalitikController::class, 'index'])->name('analitik.index');

    // ── Pengaturan ────────────────────────────────────────────
    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan.index');

    // ─────────────────────────────────────────────────────────
    // ── Berlangganan ──────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('berlangganan',           [BerlanggananController::class, 'index'])->name('berlangganan.index');
    Route::get('berlangganan/create',    [BerlanggananController::class, 'create'])->name('berlangganan.create');
    Route::post('berlangganan',          [BerlanggananController::class, 'store'])->name('berlangganan.store');
    Route::get('berlangganan/{id}',      [BerlanggananController::class, 'show'])->name('berlangganan.show');
    Route::get('berlangganan/{id}/edit', [BerlanggananController::class, 'edit'])->name('berlangganan.edit');
    Route::put('berlangganan/{id}',      [BerlanggananController::class, 'update'])->name('berlangganan.update');
    Route::delete('berlangganan/{id}',   [BerlanggananController::class, 'destroy'])->name('berlangganan.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Order ─────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('order',           [OrderController::class, 'index'])->name('order.index');
    Route::get('order/create',    [OrderController::class, 'create'])->name('order.create');
    Route::post('order',          [OrderController::class, 'store'])->name('order.store');
    Route::get('order/{id}',      [OrderController::class, 'show'])->name('order.show');
    Route::get('order/{id}/edit', [OrderController::class, 'edit'])->name('order.edit');
    Route::put('order/{id}',      [OrderController::class, 'update'])->name('order.update');
    Route::delete('order/{id}',   [OrderController::class, 'destroy'])->name('order.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Permintaan Bayar ──────────────────────────────────────
    // PENTING: route 'buat' harus SEBELUM '{id}' agar tidak tertangkap wildcard
    // ─────────────────────────────────────────────────────────
    Route::get('permintaan-bayar',           [PermintaanBayarController::class, 'index'])->name('permintaan-bayar.index');
    Route::get('permintaan-bayar/buat',      [PermintaanBayarController::class, 'create'])->name('permintaan-bayar.create');
    Route::post('permintaan-bayar',          [PermintaanBayarController::class, 'store'])->name('permintaan-bayar.store');
    Route::get('permintaan-bayar/{id}',      [PermintaanBayarController::class, 'show'])->name('permintaan-bayar.show');
    Route::delete('permintaan-bayar/{id}',   [PermintaanBayarController::class, 'destroy'])->name('permintaan-bayar.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Semua Produk ──────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('semua-produk',           [SemuaProdukController::class, 'index'])->name('semua-produk.index');
    Route::get('semua-produk/create',    [SemuaProdukController::class, 'create'])->name('semua-produk.create');
    Route::post('semua-produk',          [SemuaProdukController::class, 'store'])->name('semua-produk.store');
    Route::get('semua-produk/{id}',      [SemuaProdukController::class, 'show'])->name('semua-produk.show');
    Route::get('semua-produk/{id}/edit', [SemuaProdukController::class, 'edit'])->name('semua-produk.edit');
    Route::put('semua-produk/{id}',      [SemuaProdukController::class, 'update'])->name('semua-produk.update');
    Route::delete('semua-produk/{id}',   [SemuaProdukController::class, 'destroy'])->name('semua-produk.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Produk Fisik ──────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('produk-fisik',           [ProdukFisikController::class, 'index'])->name('produk-fisik.index');
    Route::get('produk-fisik/create',    [ProdukFisikController::class, 'create'])->name('produk-fisik.create');
    Route::post('produk-fisik',          [ProdukFisikController::class, 'store'])->name('produk-fisik.store');
    Route::get('produk-fisik/{id}',      [ProdukFisikController::class, 'show'])->name('produk-fisik.show');
    Route::get('produk-fisik/{id}/edit', [ProdukFisikController::class, 'edit'])->name('produk-fisik.edit');
    Route::put('produk-fisik/{id}',      [ProdukFisikController::class, 'update'])->name('produk-fisik.update');
    Route::delete('produk-fisik/{id}',   [ProdukFisikController::class, 'destroy'])->name('produk-fisik.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Kelas Online (OD) ─────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('kelas-online',           [KelasOnlineController::class, 'index'])->name('kelas-online.index');
    Route::get('kelas-online/create',    [KelasOnlineController::class, 'create'])->name('kelas-online.create');
    Route::post('kelas-online',          [KelasOnlineController::class, 'store'])->name('kelas-online.store');
    Route::get('kelas-online/{id}',      [KelasOnlineController::class, 'show'])->name('kelas-online.show');
    Route::get('kelas-online/{id}/edit', [KelasOnlineController::class, 'edit'])->name('kelas-online.edit');
    Route::put('kelas-online/{id}',      [KelasOnlineController::class, 'update'])->name('kelas-online.update');
    Route::delete('kelas-online/{id}',   [KelasOnlineController::class, 'destroy'])->name('kelas-online.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Coaching & Mentoring ──────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('coaching-mentoring',           [CoachingMentoringController::class, 'index'])->name('coaching-mentoring.index');
    Route::get('coaching-mentoring/create',    [CoachingMentoringController::class, 'create'])->name('coaching-mentoring.create');
    Route::post('coaching-mentoring',          [CoachingMentoringController::class, 'store'])->name('coaching-mentoring.store');
    Route::get('coaching-mentoring/{id}',      [CoachingMentoringController::class, 'show'])->name('coaching-mentoring.show');
    Route::get('coaching-mentoring/{id}/edit', [CoachingMentoringController::class, 'edit'])->name('coaching-mentoring.edit');
    Route::put('coaching-mentoring/{id}',      [CoachingMentoringController::class, 'update'])->name('coaching-mentoring.update');
    Route::delete('coaching-mentoring/{id}',   [CoachingMentoringController::class, 'destroy'])->name('coaching-mentoring.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Penggalangan Dana ─────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('penggalangan-dana',           [PenggalanganDanaController::class, 'index'])->name('penggalangan-dana.index');
    Route::get('penggalangan-dana/create',    [PenggalanganDanaController::class, 'create'])->name('penggalangan-dana.create');
    Route::post('penggalangan-dana',          [PenggalanganDanaController::class, 'store'])->name('penggalangan-dana.store');
    Route::get('penggalangan-dana/{id}',      [PenggalanganDanaController::class, 'show'])->name('penggalangan-dana.show');
    Route::get('penggalangan-dana/{id}/edit', [PenggalanganDanaController::class, 'edit'])->name('penggalangan-dana.edit');
    Route::put('penggalangan-dana/{id}',      [PenggalanganDanaController::class, 'update'])->name('penggalangan-dana.update');
    Route::delete('penggalangan-dana/{id}',   [PenggalanganDanaController::class, 'destroy'])->name('penggalangan-dana.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Paket Berlangganan ────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('paket-berlangganan',           [PaketBerlanggananController::class, 'index'])->name('paket-berlangganan.index');
    Route::get('paket-berlangganan/create',    [PaketBerlanggananController::class, 'create'])->name('paket-berlangganan.create');
    Route::post('paket-berlangganan',          [PaketBerlanggananController::class, 'store'])->name('paket-berlangganan.store');
    Route::get('paket-berlangganan/{id}',      [PaketBerlanggananController::class, 'show'])->name('paket-berlangganan.show');
    Route::get('paket-berlangganan/{id}/edit', [PaketBerlanggananController::class, 'edit'])->name('paket-berlangganan.edit');
    Route::put('paket-berlangganan/{id}',      [PaketBerlanggananController::class, 'update'])->name('paket-berlangganan.update');
    Route::delete('paket-berlangganan/{id}',   [PaketBerlanggananController::class, 'destroy'])->name('paket-berlangganan.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Ebook ─────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('ebook',           [EbookController::class, 'index'])->name('ebook.index');
    Route::get('ebook/create',    [EbookController::class, 'create'])->name('ebook.create');
    Route::post('ebook',          [EbookController::class, 'store'])->name('ebook.store');
    Route::get('ebook/{id}',      [EbookController::class, 'show'])->name('ebook.show');
    Route::get('ebook/{id}/edit', [EbookController::class, 'edit'])->name('ebook.edit');
    Route::put('ebook/{id}',      [EbookController::class, 'update'])->name('ebook.update');
    Route::delete('ebook/{id}',   [EbookController::class, 'destroy'])->name('ebook.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Podcast ───────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('podcast',           [PodcastController::class, 'index'])->name('podcast.index');
    Route::get('podcast/create',    [PodcastController::class, 'create'])->name('podcast.create');
    Route::post('podcast',          [PodcastController::class, 'store'])->name('podcast.store');
    Route::get('podcast/{id}',      [PodcastController::class, 'show'])->name('podcast.show');
    Route::get('podcast/{id}/edit', [PodcastController::class, 'edit'])->name('podcast.edit');
    Route::put('podcast/{id}',      [PodcastController::class, 'update'])->name('podcast.update');
    Route::delete('podcast/{id}',   [PodcastController::class, 'destroy'])->name('podcast.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Audio Book ────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('audio-book',           [AudioBookController::class, 'index'])->name('audio-book.index');
    Route::get('audio-book/create',    [AudioBookController::class, 'create'])->name('audio-book.create');
    Route::post('audio-book',          [AudioBookController::class, 'store'])->name('audio-book.store');
    Route::get('audio-book/{id}',      [AudioBookController::class, 'show'])->name('audio-book.show');
    Route::get('audio-book/{id}/edit', [AudioBookController::class, 'edit'])->name('audio-book.edit');
    Route::put('audio-book/{id}',      [AudioBookController::class, 'update'])->name('audio-book.update');
    Route::delete('audio-book/{id}',   [AudioBookController::class, 'destroy'])->name('audio-book.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Tulisan ───────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('tulisan',           [TulisanController::class, 'index'])->name('tulisan.index');
    Route::get('tulisan/create',    [TulisanController::class, 'create'])->name('tulisan.create');
    Route::post('tulisan',          [TulisanController::class, 'store'])->name('tulisan.store');
    Route::get('tulisan/{id}',      [TulisanController::class, 'show'])->name('tulisan.show');
    Route::get('tulisan/{id}/edit', [TulisanController::class, 'edit'])->name('tulisan.edit');
    Route::put('tulisan/{id}',      [TulisanController::class, 'update'])->name('tulisan.update');
    Route::delete('tulisan/{id}',   [TulisanController::class, 'destroy'])->name('tulisan.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Web Komik ─────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('web-komik',           [WebKomikController::class, 'index'])->name('web-komik.index');
    Route::get('web-komik/create',    [WebKomikController::class, 'create'])->name('web-komik.create');
    Route::post('web-komik',          [WebKomikController::class, 'store'])->name('web-komik.store');
    Route::get('web-komik/{id}',      [WebKomikController::class, 'show'])->name('web-komik.show');
    Route::get('web-komik/{id}/edit', [WebKomikController::class, 'edit'])->name('web-komik.edit');
    Route::put('web-komik/{id}',      [WebKomikController::class, 'update'])->name('web-komik.update');
    Route::delete('web-komik/{id}',   [WebKomikController::class, 'destroy'])->name('web-komik.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Creator Support Page ──────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('creator-support-page',           [CreatorSupportPageController::class, 'index'])->name('creator-support-page.index');
    Route::get('creator-support-page/create',    [CreatorSupportPageController::class, 'create'])->name('creator-support-page.create');
    Route::post('creator-support-page',          [CreatorSupportPageController::class, 'store'])->name('creator-support-page.store');
    Route::get('creator-support-page/{id}',      [CreatorSupportPageController::class, 'show'])->name('creator-support-page.show');
    Route::get('creator-support-page/{id}/edit', [CreatorSupportPageController::class, 'edit'])->name('creator-support-page.edit');
    Route::put('creator-support-page/{id}',      [CreatorSupportPageController::class, 'update'])->name('creator-support-page.update');
    Route::delete('creator-support-page/{id}',   [CreatorSupportPageController::class, 'destroy'])->name('creator-support-page.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Membership & SaaS ─────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('membership-saas',           [MembershipSaasController::class, 'index'])->name('membership-saas.index');
    Route::get('membership-saas/create',    [MembershipSaasController::class, 'create'])->name('membership-saas.create');
    Route::post('membership-saas',          [MembershipSaasController::class, 'store'])->name('membership-saas.store');
    Route::get('membership-saas/{id}',      [MembershipSaasController::class, 'show'])->name('membership-saas.show');
    Route::get('membership-saas/{id}/edit', [MembershipSaasController::class, 'edit'])->name('membership-saas.edit');
    Route::put('membership-saas/{id}',      [MembershipSaasController::class, 'update'])->name('membership-saas.update');
    Route::delete('membership-saas/{id}',   [MembershipSaasController::class, 'destroy'])->name('membership-saas.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Bootcamp CRUD ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('/bootcamps',                         [BootcampController::class, 'index'])->name('bootcamps.index');
    Route::post('/bootcamps',                        [BootcampController::class, 'store'])->name('bootcamps.store');
    Route::get('/bootcamps/{bootcamp}',              [BootcampController::class, 'show'])->name('bootcamps.show');
    Route::put('/bootcamps/{bootcamp}',              [BootcampController::class, 'update'])->name('bootcamps.update');
    Route::patch('/bootcamps/{bootcamp}/status',     [BootcampController::class, 'updateStatus'])->name('bootcamps.status');
    Route::post('/bootcamps/{bootcamp}/duplicate',   [BootcampController::class, 'duplicate'])->name('bootcamps.duplicate');
    Route::delete('/bootcamps/{bootcamp}',           [BootcampController::class, 'destroy'])->name('bootcamps.destroy');

    // ── Sesi Meeting ──────────────────────────────────────────
    Route::post('/bootcamps/{bootcamp}/sesi',              [SesiController::class, 'store'])->name('sesi.store');
    Route::put('/bootcamps/{bootcamp}/sesi/{sesi}',        [SesiController::class, 'update'])->name('sesi.update');
    Route::delete('/bootcamps/{bootcamp}/sesi/{sesi}',     [SesiController::class, 'destroy'])->name('sesi.destroy');

    // ── Bab ───────────────────────────────────────────────────
    Route::post('/bootcamps/{bootcamp}/bab',              [BabController::class, 'store'])->name('bab.store');
    Route::put('/bootcamps/{bootcamp}/bab/{bab}',         [BabController::class, 'update'])->name('bab.update');
    Route::delete('/bootcamps/{bootcamp}/bab/{bab}',      [BabController::class, 'destroy'])->name('bab.destroy');

    // ── Materi ────────────────────────────────────────────────
    Route::post('/bootcamps/{bootcamp}/bab/{bab}/materi',            [MateriController::class, 'store'])->name('materi.store');
    Route::put('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}',    [MateriController::class, 'update'])->name('materi.update');
    Route::delete('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}', [MateriController::class, 'destroy'])->name('materi.destroy');

    // ── Assignment ────────────────────────────────────────────
   // Assignment
    Route::post('/bootcamps/{bootcamp}/assignment',               [AssignmentController::class, 'store'])->name('assignment.store');
    Route::post('/bootcamps/{bootcamp}/assignment/{assignment}',  [AssignmentController::class, 'update'])->name('assignment.update');
    Route::put('/bootcamps/{bootcamp}/assignment/{assignment}',   [AssignmentController::class, 'update'])->name('assignment.update.put');
    Route::delete('/bootcamps/{bootcamp}/assignment/{assignment}',[AssignmentController::class, 'destroy'])->name('assignment.destroy');

    // ── Landing Page ──────────────────────────────────────────
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

    // ── Kustom Form ───────────────────────────────────────────
    Route::post('/bootcamps/{bootcamp}/kustom-form', [KustomFormController::class, 'store'])->name('kustom-form.store');
});
