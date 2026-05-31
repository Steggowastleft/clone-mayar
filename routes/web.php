<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
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
use App\Http\Controllers\DiskonController;
use App\Http\Controllers\PaymentLinkController;
use App\Http\Controllers\PelangganController;
use App\Http\Controllers\AffiliasiController;
use App\Http\Controllers\AnalitikController;
use App\Http\Controllers\PengaturanController;
use App\Http\Controllers\AccountVerificationController;
use App\Http\Controllers\Admin\AccountVerificationController as AdminAccountVerificationController;
use App\Http\Controllers\AccountSettingsController;
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
use App\Http\Controllers\BundlingController;
use App\Http\Controllers\SesiController;
use App\Http\Controllers\ProfileController;
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
use App\Http\Controllers\WebinarCatalogController;
use App\Http\Controllers\WebinarPaymentController;
use App\Http\Controllers\Admin\WithdrawalController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\AccountVerificationController as AdminAccountVerificationController_new;

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

// Cek / validasi kupon diskon (publik)
Route::post('/diskon/validate-coupon', [DiskonController::class, 'validateCoupon'])->name('diskon.validate-coupon');

// Verifikasi sertifikat bootcamp (publik)
Route::get('/sertifikat/verify/{token}', [SertifikatController::class, 'verify'])
    ->name('sertifikat.verify');

// Verifikasi sertifikat kelas online (publik)
Route::get('/kelas-online/sertifikat/verify/{qr_token}', [KelasOnlineController::class, 'verifyCertificate'])
    ->name('kelas-online.sertifikat.public-verify');

// Halaman publik kelas online (share link untuk pendaftaran peserta)
Route::get('/p/{id}/kelas-online', [KelasOnlinePublicController::class, 'show'])
    ->name('kelas-online.public');
Route::post('/p/{id}/kelas-online/daftar', [KelasOnlinePublicController::class, 'daftar'])
    ->name('kelas-online.daftar');

// ── Catalog Routes (PUBLIC) ─────────────────────────────
Route::get('/webinar/catalog', [WebinarCatalogController::class, 'index'])->name('webinar.catalog');
Route::get('/webinars/catalog', [WebinarCatalogController::class, 'index'])->name('webinar.katalog');
Route::get('/webinar/katalog', [WebinarCatalogController::class, 'index']);
Route::get('/webinars/katalog', [WebinarCatalogController::class, 'index']);

Route::get('/bootcamp/catalog', [BootcampCatalogController::class, 'index'])->name('bootcamp.catalog');
Route::get('/bootcamps/catalog', [BootcampCatalogController::class, 'index'])->name('bootcamps.catalog');
Route::get('/bootcamp/katalog', [BootcampCatalogController::class, 'index']);
Route::get('/bootcamps/katalog', [BootcampCatalogController::class, 'index']);

Route::get('/kelas-online/catalog', [\App\Http\Controllers\KelasOnlineCatalogController::class, 'index'])->name('kelas-online.catalog');
Route::get('/kelas-online/katalog', [\App\Http\Controllers\KelasOnlineCatalogController::class, 'index'])->name('kelas-online.katalog');

Route::get('/ebook/catalog', [EbookController::class, 'catalog'])->name('ebook.catalog');
Route::get('/ebook/katalog', [EbookController::class, 'catalog']);
Route::get('/ebook/{ebook}/p', [EbookController::class, 'publicShow'])->name('ebook.public');

Route::get('/produk-digital/catalog', [ProdukDigitalController::class, 'catalog'])->name('produk-digital.catalog');
Route::get('/produk-digital/katalog', [ProdukDigitalController::class, 'catalog']);
Route::get('/produk-digital/{produkDigital}/p', [ProdukDigitalController::class, 'publicShow'])->name('produk-digital.public');

Route::get('/coaching-mentoring/catalog', [CoachingMentoringController::class, 'catalog'])->name('coaching-mentoring.catalog');
Route::get('/coaching-mentoring/katalog', [CoachingMentoringController::class, 'catalog']);
Route::get('/coaching-mentoring/{coachingMentoring}/p', [CoachingMentoringController::class, 'publicShow'])->name('coaching-mentoring.public');

Route::get('/payment-link/catalog', [PaymentLinkController::class, 'catalog'])->name('payment-link.catalog');
Route::get('/payment-link/katalog', [PaymentLinkController::class, 'catalog']);
Route::get('/payment-link/{paymentLink}/p', [PaymentLinkController::class, 'publicShow'])->name('payment-link.public');

Route::get('/tulisan/catalog', [TulisanController::class, 'catalog'])->name('tulisan.catalog');
Route::get('/tulisan/katalog', [TulisanController::class, 'catalog']);
Route::get('/tulisan/{tulisan}/p', [TulisanController::class, 'publicShow'])->name('tulisan.public');

Route::get('/penggalangan-dana/catalog', [PenggalanganDanaController::class, 'catalog'])->name('penggalangan-dana.catalog');
Route::get('/penggalangan-dana/katalog', [PenggalanganDanaController::class, 'catalog']);
Route::get('/penggalangan-dana/{penggalanganDana}/p', [PenggalanganDanaController::class, 'publicShow'])->name('penggalangan-dana.public');

Route::get('/event/catalog', [EventController::class, 'catalog'])->name('event.catalog');
Route::get('/event/katalog', [EventController::class, 'catalog']);
Route::get('/event/{event}/p', [EventController::class, 'publicShow'])->name('event.public');

Route::get('/bundling/catalog', [BundlingController::class, 'catalog'])->name('bundling.catalog');
Route::get('/bundling/katalog', [BundlingController::class, 'catalog']);
Route::get('/p/{bundling}/bundling', [BundlingController::class, 'publicShow'])->name('bundlings.public');

Route::get('/semua-produk/catalog', [SemuaProdukController::class, 'catalog'])->name('semua-produk.catalog');
Route::get('/catalog', [SemuaProdukController::class, 'catalog'])->name('catalog.index');

Route::get('/webinar/{webinar}', [WebinarCatalogController::class, 'show'])->name('webinar.show');
Route::get('/p/{webinar}/webinar', [WebinarCatalogController::class, 'show'])->name('webinar.public');
Route::get('/webinar/{webinar}/detail', [WebinarCatalogController::class, 'show'])->name('webinar.show.detail');
Route::get('/webinar/{webinar}/checkout', [WebinarPaymentController::class, 'checkout'])->name('webinar.checkout');
Route::post('/webinar/{webinar}/payment/process', [WebinarPaymentController::class, 'processPayment'])->name('webinar.payment.process');
Route::post('/webinar/payment/validate', [WebinarPaymentController::class, 'validate'])->name('webinar.payment.validate');
Route::get('/webinar/confirmation', function () {
    return Inertia::render('webinar/confirmation', [
        'order_id' => request('order_id'),
        'status' => request('status'),
    ]);
})->name('webinar.confirmation');
Route::post('/webinar/payment/notification', [WebinarPaymentController::class, 'notification'])->name('webinar.payment.notification');

// ── Unified Checkout Routes ─────────────────────────────
Route::post('/checkout/process', [\App\Http\Controllers\CheckoutController::class, 'processPayment'])->name('checkout.process');
Route::post('/checkout/validate', [\App\Http\Controllers\CheckoutController::class, 'validatePayment'])->name('checkout.validate');
Route::get('/checkout/confirmation', function () {
    return Inertia::render('checkout/confirmation', [
        'order_id' => request('order_id'),
        'status' => request('status'),
    ]);
})->name('checkout.confirmation');
Route::post('/checkout/notification', [\App\Http\Controllers\CheckoutController::class, 'notification'])->name('checkout.notification');


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
    Route::get('/peserta/register',  [PesertaAuthController::class, 'showRegister'])->name('peserta.register');
    Route::post('/peserta/register', [PesertaAuthController::class, 'register']);
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
    Route::post('/profile/update',   [PesertaDashboardController::class, 'updateProfile'])->name('profile.update');
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

    // Viewer produk digital non-bootcamp & non-kelas online
    Route::get('/produk/{type}/{id}', [PesertaDashboardController::class, 'viewProduct'])->name('produk.view');
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

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi.index');
    Route::get('/transaksi/{id}', [TransaksiController::class, 'show'])->name('transaksi.show');

    // ----------------------------------------------------------
    // BOOTCAMP
    // ----------------------------------------------------------


    Route::get('/bootcamps/katalog', [BootcampCatalogController::class, 'index'])
        ->name('bootcamps.katalog');

    // ── Produk Digital ────────────────────────────────────────
    Route::prefix('produk-digital')->name('produk-digital.')->group(function () {
        // CRUD utama
        Route::get('/',           [ProdukDigitalController::class, 'index'])->name('index');
        Route::post('/',          [ProdukDigitalController::class, 'store'])->name('store');
        // Specific actions MUST be defined BEFORE wildcards
        Route::post('/upload-image',               [ProdukDigitalController::class, 'uploadEditorImage'])->name('upload-image');
        Route::get('/{produkDigital}',    [ProdukDigitalController::class, 'show'])->name('show');
        Route::post('/{produkDigital}',   [ProdukDigitalController::class, 'update'])->name('update');   // POST karena FormData (file upload)
        Route::delete('/{produkDigital}', [ProdukDigitalController::class, 'destroy'])->name('destroy');
        // Aksi tambahan
        Route::patch('/{produkDigital}/status',    [ProdukDigitalController::class, 'updateStatus'])->name('update-status');
        Route::post('/{produkDigital}/duplicate',  [ProdukDigitalController::class, 'duplicate'])->name('duplicate');
    });
    // ── Bundle ───────────────────────────────────────────────
    Route::get('bundle/catalog', [BundleController::class, 'catalog'])->name('bundle.catalog');
    Route::get('bundle',         [BundleController::class, 'index'])->name('bundle.index');

    // ── Bundling ──────────────────────────────────────────────
    Route::prefix('bundling')->name('bundlings.')->group(function () {
        Route::get('/',                          [BundlingController::class, 'index'])->name('index');
        Route::get('/create',                    [BundlingController::class, 'create'])->name('create');
        Route::post('/',                         [BundlingController::class, 'store'])->name('store');
        Route::get('/{bundling}',                [BundlingController::class, 'show'])->name('show');
        Route::get('/{bundling}/edit',           [BundlingController::class, 'edit'])->name('edit');
        Route::post('/{bundling}',               [BundlingController::class, 'update'])->name('update');
        Route::patch('/{bundling}/status',       [BundlingController::class, 'updateStatus'])->name('status');
        Route::delete('/{bundling}',             [BundlingController::class, 'destroy'])->name('destroy');
    });

    // ── Diskon dan Kupon ──────────────────────────────────────
    Route::get('/diskon-kupon', [DiskonController::class, 'index'])->name('diskon-kupon.index');
    Route::post('/diskon-kupon', [DiskonController::class, 'store'])->name('diskon-kupon.store');
    Route::get('/diskon-kupon/{diskon}', [DiskonController::class, 'show'])->name('diskon-kupon.show');
    Route::put('/diskon-kupon/{diskon}', [DiskonController::class, 'update'])->name('diskon-kupon.update');
    Route::delete('/diskon-kupon/{diskon}', [DiskonController::class, 'destroy'])->name('diskon-kupon.destroy');
    Route::patch('/diskon-kupon/{diskon}/status', [DiskonController::class, 'toggleStatus'])->name('diskon-kupon.status');

    // ── Webinar ───────────────────────────────────────────────
    Route::get('/webinar', [WebinarController::class, 'index'])->name('webinar.index');
    Route::post('/webinars', [WebinarController::class, 'store'])->name('webinars.store');
    Route::get('/webinars/{webinar}', [WebinarController::class, 'show'])->name('webinar.detail');
    Route::put('/webinars/{webinar}', [WebinarController::class, 'update'])->name('webinar.update');
    Route::delete('/webinars/{webinar}', [WebinarController::class, 'destroy'])->name('webinar.destroy');
    Route::patch('/webinars/{webinar}/status', [WebinarController::class, 'toggleStatus'])->name('webinar.toggle-status');
    Route::post('/webinars/{webinar}/duplicate', [WebinarController::class, 'duplicate'])->name('webinar.duplicate');
    Route::post('/webinars/{webinar}/pembicara', [WebinarController::class, 'storePembicara'])->name('webinar.pembicara.store');

    // ── Event ─────────────────────────────────────────────────
    Route::get('/event',                  [EventController::class, 'index'])->name('event.index');
    Route::post('/event',                 [EventController::class, 'store'])->name('event.store');
    Route::get('/event/{event}',          [EventController::class, 'show'])->name('event.show');
    Route::get('/event/{event}/edit',     [EventController::class, 'edit'])->name('event.edit');
    Route::put('/event/{event}',          [EventController::class, 'update'])->name('event.update');
    Route::delete('/event/{event}',       [EventController::class, 'destroy'])->name('event.destroy');
    Route::patch('/event/{event}/status', [EventController::class, 'updateStatus'])->name('event.status');
    Route::post('/event/{event}/daftar', [EventController::class, 'daftar'])
        ->middleware('auth:peserta');
    Route::post('/events/{event}/tiket', [EventController::class, 'storeTiket'])->name('event.tiket.store');
    Route::post('/events/{event}/pembicara', [EventController::class, 'storePembicara'])->name('event.pembicara.store');

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
    Route::post('/bootcamps/{bootcamp}/bab/{bab}/materi',              [MateriController::class, 'store'])->name('materi.store');
    Route::put('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}',      [MateriController::class, 'update'])->name('materi.update');
    Route::delete('/bootcamps/{bootcamp}/bab/{bab}/materi/{materi}',   [MateriController::class, 'destroy'])->name('materi.destroy');


    // ── Link Pembayaran ───────────────────────────────────────
    Route::get('/payment-link',              [PaymentLinkController::class, 'index'])
        ->name('payment-link.index');
    Route::post('/payment-link',             [PaymentLinkController::class, 'store'])
        ->name('payment-link.store');
    Route::get('/payment-link/{paymentLink}', [PaymentLinkController::class, 'show'])
        ->name('payment-link.show');
    Route::put('/payment-link/{paymentLink}', [PaymentLinkController::class, 'update'])
        ->name('payment-link.update');

    Route::delete('/payment-link/{paymentLink}', [PaymentLinkController::class, 'destroy'])
        ->name('payment-link.destroy');
    // ── Pelanggan ─────────────────────────────────────────────
    Route::get('/pelanggan', [PelangganController::class, 'index'])->name('pelanggan.index');

    // ── Affiliasi ─────────────────────────────────────────────
    Route::get('/affiliasi', [AffiliasiController::class, 'index'])->name('affiliasi.index');

    // ── Analitik ──────────────────────────────────────────────
    Route::get('/analitik', [AnalitikController::class, 'index'])->name('analitik.index');

    // ── Pengaturan ────────────────────────────────────────────
    Route::get('/pengaturan', [PengaturanController::class, 'index'])->name('pengaturan.index');

    Route::get('/pengaturan/akun', function () {
        $user = Auth::user();
        $verification = \App\Models\AccountVerification::with('documents')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->first();

        return Inertia::render('pengaturan/akun', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'business_name' => $user->business_name,
                'website' => $user->website,
                'business_email' => $user->business_email,
                'phone' => $user->phone,
                'address' => $user->address,
                'country' => $user->country,
                'province' => $user->province,
                'city' => $user->city,
                'district' => $user->district,
                'currency' => $user->currency,
                'bank_provider' => $user->bank_provider,
                'bank_account_number' => $user->bank_account_number,
                'bank_account_name' => $user->bank_account_name,
                'created_at' => $user->created_at ? $user->created_at->locale('id')->translatedFormat('d M Y H:i') : null,
            ],
            'verification' => $verification,
        ]);
    })->name('pengaturan.akun');

    Route::get('/pengaturan/withdrawal', [\App\Http\Controllers\CreatorWithdrawalController::class, 'index'])->name('pengaturan.withdrawal.index');
    Route::post('/pengaturan/withdrawal', [\App\Http\Controllers\CreatorWithdrawalController::class, 'store'])->name('pengaturan.withdrawal.store');

    // Admin-specific pages (role:admin)
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::get('/verifikasi', [AdminAccountVerificationController_new::class, 'index'])->name('verifications.index');
        Route::post('/verifikasi/{verification}/approve', [AdminAccountVerificationController_new::class, 'approve'])->name('verifications.approve');
        Route::post('/verifikasi/{verification}/reject', [AdminAccountVerificationController_new::class, 'reject'])->name('verifications.reject');
        Route::get('/users', [\App\Http\Controllers\Admin\AdminManagementController::class, 'usersIndex'])->name('users.index');
        Route::get('/products', [\App\Http\Controllers\Admin\AdminManagementController::class, 'productsIndex'])->name('products.index');
        Route::get('/products/{type}/{id}', [\App\Http\Controllers\Admin\AdminManagementController::class, 'productDetail'])->name('products.detail');
        Route::delete('/products/{type}/{id}', [\App\Http\Controllers\Admin\AdminManagementController::class, 'deleteProduct'])->name('products.delete');
    });


    // Save business and bank
    Route::post('/account/business', [AccountSettingsController::class, 'updateBusiness'])->name('account.business');
    Route::post('/account/bank', [AccountSettingsController::class, 'updateBank'])->name('account.bank');

    // Account verification (creator)
    Route::get('/account/verification', [AccountVerificationController::class, 'show'])->name('account.verification.show');
    Route::get('/account/verification/status', [AccountVerificationController::class, 'status'])->name('account.verification.status');
    Route::post('/account/verification', [AccountVerificationController::class, 'store'])->name('account.verification.store');
    Route::get('/account/verification/documents/{document}', [AccountVerificationController::class, 'downloadDocument'])->name('account.verification.document');

    // Admin UI pages (Inertia)
    Route::get('/admin/verifications/manage', function () {
        return Inertia::render('admin/verifications/Index');
    })->name('admin.verifications.ui');

    Route::get('/admin/verifications/{id}/manage', function ($id) {
        return Inertia::render('admin/verifications/Show', ['id' => $id]);
    })->name('admin.verifications.ui.show');

    // Admin landing
    Route::get('/admin', function () {
        return Inertia::render('admin/Index');
    })->name('admin.index');

    // Admin verification management
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/verifications', [AdminAccountVerificationController::class, 'index'])->name('verifications.index');
        Route::get('/verifications/{id}', [AdminAccountVerificationController::class, 'show'])->name('verifications.show');
        Route::post('/verifications/{id}/approve', [AdminAccountVerificationController::class, 'approve'])->name('verifications.approve');
        Route::post('/verifications/{id}/decline', [AdminAccountVerificationController::class, 'decline'])->name('verifications.decline');
    });

    // ── Penilaian dan Ulasan ──────────────────────────────────
    Route::get('/penilaian-ulasan', [\App\Http\Controllers\PenilaianUlasanController::class, 'index'])->name('penilaian-ulasan.index');

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

    // ── Pembayaran Tagihan ────────────────────────────────────
    Route::get('pembayaran-tagihan',         [PermintaanBayarController::class, 'index'])->name('pembayaran-tagihan.index');
    Route::post('pembayaran-tagihan/remind', [PermintaanBayarController::class, 'sendReminder'])->name('pembayaran-tagihan.remind');

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
    Route::get('produk-fisik/catalog',   [ProdukFisikController::class, 'catalog'])->name('produk-fisik.catalog');
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
    Route::get('coaching-mentoring',                                    [CoachingMentoringController::class, 'index'])->name('coaching-mentoring.index');
    Route::get('coaching-mentoring/create',                                 [CoachingMentoringController::class, 'create'])->name('coaching-mentoring.create');
    Route::post('coaching-mentoring',                                   [CoachingMentoringController::class, 'store'])->name('coaching-mentoring.store');
    Route::get('coaching-mentoring/{coachingMentoring}',                [CoachingMentoringController::class, 'show'])->name('coaching-mentoring.show');
    Route::get('coaching-mentoring/{coachingMentoring}/edit',           [CoachingMentoringController::class, 'edit'])->name('coaching-mentoring.edit');
    Route::put('coaching-mentoring/{coachingMentoring}',                [CoachingMentoringController::class, 'update'])->name('coaching-mentoring.update');
    Route::patch('coaching-mentoring/{coachingMentoring}/status',       [CoachingMentoringController::class, 'updateStatus'])->name('coaching-mentoring.status');
    Route::post('coaching-mentoring/{coachingMentoring}/duplicate',     [CoachingMentoringController::class, 'duplicate'])->name('coaching-mentoring.duplicate');
    Route::delete('coaching-mentoring/{coachingMentoring}',             [CoachingMentoringController::class, 'destroy'])->name('coaching-mentoring.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Penggalangan Dana ─────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('penggalangan-dana',                              [PenggalanganDanaController::class, 'index'])->name('penggalangan-dana.index');
    Route::get('penggalangan-dana/create',                       [PenggalanganDanaController::class, 'create'])->name('penggalangan-dana.create');
    Route::post('penggalangan-dana',                             [PenggalanganDanaController::class, 'store'])->name('penggalangan-dana.store');
    Route::get('penggalangan-dana/{penggalanganDana}',          [PenggalanganDanaController::class, 'show'])->name('penggalangan-dana.show');
    Route::get('penggalangan-dana/{penggalanganDana}/edit',     [PenggalanganDanaController::class, 'edit'])->name('penggalangan-dana.edit');
    Route::put('penggalangan-dana/{penggalanganDana}',          [PenggalanganDanaController::class, 'update'])->name('penggalangan-dana.update');
    Route::patch('penggalangan-dana/{penggalanganDana}/status', [PenggalanganDanaController::class, 'updateStatus'])->name('penggalangan-dana.status');
    Route::post('penggalangan-dana/{penggalanganDana}/duplicate', [PenggalanganDanaController::class, 'duplicate'])->name('penggalangan-dana.duplicate');
    Route::post('penggalangan-dana/{penggalanganDana}/kabar', [PenggalanganDanaController::class, 'storeKabar'])->name('penggalangan-dana.kabar.store');
    Route::delete('penggalangan-dana/{penggalanganDana}',       [PenggalanganDanaController::class, 'destroy'])->name('penggalangan-dana.destroy');

    // ─────────────────────────────────────────────────────────
    // ── Paket Berlangganan ────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('paket-berlangganan/catalog',   [PaketBerlanggananController::class, 'catalog'])->name('paket-berlangganan.catalog');
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
    Route::get('ebook/{ebook}',      [EbookController::class, 'show'])->name('ebook.show');
    Route::get('ebook/{ebook}/edit', [EbookController::class, 'edit'])->name('ebook.edit');
    Route::put('ebook/{ebook}',      [EbookController::class, 'update'])->name('ebook.update');
    Route::delete('ebook/{ebook}',   [EbookController::class, 'destroy'])->name('ebook.destroy');
    Route::patch('ebook/{ebook}/status', [EbookController::class, 'toggleStatus'])->name('ebook.status');
    Route::post('ebook/{ebook}/duplicate', [EbookController::class, 'duplicate'])->name('ebook.duplicate');

    // ─────────────────────────────────────────────────────────
    // ── Podcast ───────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('podcast/catalog',   [PodcastController::class, 'catalog'])->name('podcast.catalog');
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
    Route::get('audio-book/catalog',   [AudioBookController::class, 'catalog'])->name('audio-book.catalog');
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
    Route::get('/tulisan',                [TulisanController::class, 'index'])->name('tulisan.index');
    Route::get('/tulisan/catalog',        [TulisanController::class, 'catalog'])->name('tulisan.catalog');
    Route::get('/tulisan/create',         [TulisanController::class, 'create'])->name('tulisan.create');
    Route::post('tulisan',          [TulisanController::class, 'store'])->name('tulisan.store');
    Route::get('tulisan/{tulisan}',      [TulisanController::class, 'show'])->name('tulisan.show');
    Route::get('tulisan/{tulisan}/edit', [TulisanController::class, 'edit'])->name('tulisan.edit');
    Route::put('tulisan/{tulisan}',      [TulisanController::class, 'update'])->name('tulisan.update');
    Route::delete('tulisan/{tulisan}',   [TulisanController::class, 'destroy'])->name('tulisan.destroy');
    Route::patch('tulisan/{tulisan}/status', [TulisanController::class, 'toggleStatus'])->name('tulisan.status');
    Route::post('tulisan/{tulisan}/duplicate', [TulisanController::class, 'duplicate'])->name('tulisan.duplicate');

    // ─────────────────────────────────────────────────────────
    // ── Web Komik ─────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::get('web-komik/catalog',   [WebKomikController::class, 'catalog'])->name('web-komik.catalog');
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
    Route::get('creator-support-page/catalog',   [CreatorSupportPageController::class, 'catalog'])->name('creator-support-page.catalog');
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
    Route::get('membership-saas/catalog',   [MembershipSaasController::class, 'catalog'])->name('membership-saas.catalog');
    Route::get('membership-saas',           [MembershipSaasController::class, 'index'])->name('membership-saas.index');
    Route::get('membership-saas/create',    [MembershipSaasController::class, 'create'])->name('membership-saas.create');
    Route::post('membership-saas',          [MembershipSaasController::class, 'store'])->name('membership-saas.store');
    Route::get('membership-saas/{id}',      [MembershipSaasController::class, 'show'])->name('membership-saas.show');
    Route::get('membership-saas/{id}/edit', [MembershipSaasController::class, 'edit'])->name('membership-saas.edit');
    Route::put('membership-saas/{id}',      [MembershipSaasController::class, 'update'])->name('membership-saas.update');
    Route::delete('membership-saas/{id}',   [MembershipSaasController::class, 'destroy'])->name('membership-saas.destroy');



    // ── Assignment ────────────────────────────────────────────

    Route::post('/bootcamps/{bootcamp}/assignment',               [AssignmentController::class, 'store'])->name('assignment.store');
    Route::post('/bootcamps/{bootcamp}/assignment/{assignment}',  [AssignmentController::class, 'update'])->name('assignment.update');
    Route::delete('/bootcamps/{bootcamp}/assignment/{assignment}', [AssignmentController::class, 'destroy'])->name('assignment.destroy');

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

    // ─────────────────────────────────────────────────────────
    // ── Admin Withdrawal Management ───────────────────────────
    // ─────────────────────────────────────────────────────────
    Route::prefix('admin/withdrawal')->name('admin.withdrawal.')->group(function () {
        Route::get('/', [WithdrawalController::class, 'index'])->name('index');
        Route::get('/{withdrawal}', [WithdrawalController::class, 'show'])->name('show');
        Route::post('/{withdrawal}/approve', [WithdrawalController::class, 'approve'])->name('approve');
        Route::post('/{withdrawal}/reject', [WithdrawalController::class, 'reject'])->name('reject');
        Route::post('/{withdrawal}/mark-completed', [WithdrawalController::class, 'markCompleted'])->name('mark-completed');
    });
    Route::get('/admin/withdrawal/stats', [WithdrawalController::class, 'stats'])->name('withdrawal.stats');
});