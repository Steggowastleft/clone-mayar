<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Models\Bootcamp;
use App\Models\Webinar;
use App\Models\Event;
use App\Models\Ebook;
use App\Models\ProdukDigital;
use App\Models\CoachingMentoring;
use App\Models\PenggalanganDana;
use App\Models\PaymentLink;
use App\Models\Tulisan;
use App\Models\Pembayaran;
use App\Models\Pendaftaran;
use App\Models\Rating;
use App\Models\Peserta;
use App\Models\KelasOnline;

class DashboardController extends Controller
{
    public function index()
    {
        $timeRange = request('timeRange', '30');
        $days      = (int) $timeRange;

        $now       = Carbon::now();
        $startCurr = $now->copy()->subDays($days)->startOfDay();
        $startPrev = $now->copy()->subDays($days * 2)->startOfDay();
        $endPrev   = $now->copy()->subDays($days)->endOfDay();

        // ── Total Pendapatan (dari Pembayaran confirmed) ─────────────────
        $revenueCurr = Pembayaran::where('status', 'confirmed')
            ->whereBetween('confirmed_at', [$startCurr, $now])
            ->sum('jumlah');

        $revenuePrev = Pembayaran::where('status', 'confirmed')
            ->whereBetween('confirmed_at', [$startPrev, $endPrev])
            ->sum('jumlah');

        $revenueTrend = $this->calcTrend($revenuePrev, $revenueCurr);

        // ── Total Transaksi (Pendaftaran aktif + pending) ─────────────────
        $transaksiCurr = Pendaftaran::whereBetween('created_at', [$startCurr, $now])->count();
        $transaksiPrev = Pendaftaran::whereBetween('created_at', [$startPrev, $endPrev])->count();
        $transaksiTrend = $this->calcTrend($transaksiPrev, $transaksiCurr);

        // ── Pembayaran Belum Dikonfirmasi ─────────────────────────────────
        $pendingPayment = Pembayaran::where('status', 'pending')->sum('jumlah');

        // ── Saldo Akun (semua pembayaran confirmed tanpa batas waktu) ─────
        $totalBalance = Pembayaran::where('status', 'confirmed')->sum('jumlah');

        // ── Total Produk (semua tabel) ────────────────────────────────────
        $totalProduk = Bootcamp::count()
            + Webinar::count()
            + Event::count()
            + Ebook::count()
            + ProdukDigital::count()
            + CoachingMentoring::count()
            + PenggalanganDana::count()
            + PaymentLink::count()
            + Tulisan::count();

        // ── Total Pelanggan unik ──────────────────────────────────────────
        $totalPelanggan = Peserta::count();

        // ── Chart Data (pendapatan & transaksi per hari) ──────────────────
        $chartData = $this->buildChartData($days, $now);

        // ── Produk Terlaris (dari Pendaftaran, group by registrable_type+id) ─
        $topProducts = $this->getTopProducts();

        // ── Transaksi Terbaru (Pembayaran terbaru, 5 data) ───────────────
        $recentTransaksi = Pembayaran::with('bootcamp.user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($p) {
                return [
                    'id'      => $p->id,
                    'type'    => $p->status === 'rejected' ? 'refund' : 'income',
                    'title'   => $p->bootcamp ? 'Penjualan ' . $p->bootcamp->name : 'Pembayaran #' . $p->order_id,
                    'amount'  => (float) $p->jumlah,
                    'date'    => $p->created_at->locale('id')->diffForHumans(),
                    'penjual' => $p->bootcamp?->user?->name ?? 'Admin',
                ];
            });

        // Tambahkan dari Pendaftaran (non-bootcamp) jika ada harga_bayar > 0
        $recentPendaftaran = Pendaftaran::with('registrable.user')
            ->where('harga_bayar', '>', 0)
            ->whereNotIn('registrable_type', ['App\\Models\\Bootcamp']) // Bootcamp sudah dari Pembayaran
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($p) {
                $productName = 'Produk';
                $penjual = 'Admin';
                if ($p->registrable) {
                    $productName = $p->registrable->nama
                        ?? $p->registrable->name
                        ?? class_basename($p->registrable_type);
                    $penjual = $p->registrable->user?->name ?? 'Admin';
                }
                return [
                    'id'      => 'p_' . $p->id,
                    'type'    => 'income',
                    'title'   => 'Penjualan ' . $productName,
                    'amount'  => (float) $p->harga_bayar,
                    'date'    => $p->created_at->locale('id')->diffForHumans(),
                    'penjual' => $penjual,
                ];
            });

        $allTransaksi = $recentTransaksi->concat($recentPendaftaran)
            ->sortByDesc(fn($t) => $t['date'])
            ->values()
            ->take(10);

        // ── Ulasan / Rating Terbaru ───────────────────────────────────────
        $recentReviews = Rating::with(['bootcamp', 'peserta'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($r) {
                return [
                    'id'          => $r->id,
                    'productName' => $r->bootcamp ? $r->bootcamp->name : 'Produk',
                    'reviewer'    => $r->peserta
                        ? ($r->tampil_anonim ? 'Anonim' : $r->peserta->nama)
                        : 'Pengguna',
                    'rating'  => $r->bintang,
                    'comment' => $r->ulasan ?? '',
                    'date'    => $r->created_at->locale('id')->diffForHumans(),
                ];
            });

        $user = auth()->user();
        $verificationStatus = 'unverified';
        if ($user) {
            $verification = \App\Models\AccountVerification::where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->first();
            $verificationStatus = $verification ? $verification->status : 'unverified';
        }

        return Inertia::render('dashboard/index', [
            'dashboardData' => [
                'balance'           => (float) $totalBalance,
                'totalRevenue'      => (float) $revenueCurr,
                'totalTransactions' => (int) $transaksiCurr,
                'pendingPayment'    => (float) $pendingPayment,
                'revenueTrend'      => $revenueTrend,
                'transaksiTrend'    => $transaksiTrend,
                'chartData'         => $chartData,
                'products'          => $topProducts,
                'allProducts'       => $this->getAllProducts(),
                'transactions'      => $allTransaksi->values()->toArray(),
                'reviews'           => $recentReviews->toArray(),
            ],
            'user' => [
                'name' => $user?->name ?? 'Pengguna',
                'role' => $user?->role ?? 'Creator',
                'verificationStatus' => $verificationStatus,
            ],
        ]);
    }

    // ── Hitung persentase perubahan ────────────────────────────────────────
    private function calcTrend(float $prev, float $curr): ?float
    {
        if ($prev == 0) {
            return $curr > 0 ? 100.0 : null;
        }
        return round((($curr - $prev) / $prev) * 100, 1);
    }

    // ── Build chart data per hari ──────────────────────────────────────────
    private function buildChartData(int $days, Carbon $now): array
    {
        $start = $now->copy()->subDays($days - 1)->startOfDay();

        // Ambil pendapatan per hari dari Pembayaran confirmed
        $pembayaranPerHari = Pembayaran::where('status', 'confirmed')
            ->where('confirmed_at', '>=', $start)
            ->select(
                DB::raw('DATE(confirmed_at) as tanggal'),
                DB::raw('SUM(jumlah) as total')
            )
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        // Ambil transaksi per hari dari Pendaftaran
        $transaksiPerHari = Pendaftaran::where('created_at', '>=', $start)
            ->select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        $chartData = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->format('Y-m-d');
            $label = $now->copy()->subDays($i)->format('d/m');

            $chartData[] = [
                'date'       => $label,
                'pendapatan' => (float) ($pembayaranPerHari[$date] ?? 0),
                'transaksi'  => (int) ($transaksiPerHari[$date] ?? 0),
            ];
        }

        return $chartData;
    }

    // ── Ambil produk terlaris ──────────────────────────────────────────────
    private function getTopProducts(): array
    {
        $products = [];

        // Bootcamp: hitung dari Pendaftaran
        $bootcamps = Bootcamp::with('user')
            ->withCount([
                'pendaftaran as total_terjual' => function ($q) {
                    $q->where('status', 'aktif');
                }
            ])
            ->withAvg('ratings', 'bintang')
            ->having('total_terjual', '>', 0)
            ->orderByDesc('total_terjual')
            ->limit(5)
            ->get();

        foreach ($bootcamps as $b) {
            $revenue = Pembayaran::where('bootcamp_id', $b->id)
                ->where('status', 'confirmed')
                ->sum('jumlah');

            $products[] = [
                'id'      => $b->id,
                'name'    => $b->name,
                'sold'    => (int) $b->total_terjual,
                'revenue' => (float) $revenue,
                'rating'  => round((float) ($b->ratings_avg_bintang ?? 0), 1),
                'image'   => $b->cover_url,
                'penjual' => $b->user?->name ?? 'Admin',
            ];
        }

        // Ebook: hitung dari field terjual
        $ebooks = Ebook::with('user')
            ->where('terjual', '>', 0)
            ->orderByDesc('terjual')
            ->limit(3)
            ->get();

        foreach ($ebooks as $e) {
            $products[] = [
                'id'      => 'ebook_' . $e->id,
                'name'    => $e->nama,
                'sold'    => (int) ($e->terjual ?? 0),
                'revenue' => (float) (($e->terjual ?? 0) * ($e->harga ?? 0)),
                'rating'  => 0,
                'image'   => null,
                'penjual' => $e->user?->name ?? 'Admin',
            ];
        }

        // ProdukDigital: hitung dari field total_penjualan
        $produkDigitals = ProdukDigital::with('user')
            ->where('total_penjualan', '>', 0)
            ->orderByDesc('total_penjualan')
            ->limit(3)
            ->get();

        foreach ($produkDigitals as $pd) {
            $products[] = [
                'id'      => 'digital_' . $pd->id,
                'name'    => $pd->nama,
                'sold'    => (int) ($pd->total_penjualan ?? 0),
                'revenue' => (float) (($pd->total_penjualan ?? 0) * ($pd->harga ?? 0)),
                'rating'  => 0,
                'image'   => null,
                'penjual' => $pd->user?->name ?? 'Admin',
            ];
        }

        // Sort semua berdasarkan sold desc, ambil top 10
        usort($products, fn($a, $b) => $b['sold'] - $a['sold']);

        return array_slice($products, 0, 10);
    }

    // ── Ambil semua produk untuk sidebar ───────────────────────────────────
    private function getAllProducts()
    {
        $userId = auth()->id();
        $products = [];

        // Fetch Webinar
        $webinars = Webinar::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($w) => [
                'id' => "webinar:{$w->id}",
                'product_id' => $w->id,
                'type' => 'webinar',
                'nama' => $w->nama,
                'harga' => $w->harga ?? 0,
                'status' => $w->status,
                'tanggal' => $w->created_at->format('d M Y H:i'),
                'terjual' => $w->peserta ?? 0,
                'kategori' => 'Webinar',
            ])->toArray();
        $products = array_merge($products, $webinars);

        // Fetch Event
        $events = Event::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($e) => [
                'id' => "event:{$e->id}",
                'product_id' => $e->id,
                'type' => 'event',
                'nama' => $e->nama,
                'harga' => $e->harga ?? 0,
                'status' => $e->status,
                'tanggal' => $e->created_at->format('d M Y H:i'),
                'terjual' => $e->pendaftaran()->count(),
                'kategori' => 'Event',
            ])->toArray();
        $products = array_merge($products, $events);

        // Fetch Produk Digital
        $produkDigital = ProdukDigital::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "produk_digital:{$p->id}",
                'product_id' => $p->id,
                'type' => 'produk-digital',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => $p->total_penjualan ?? 0,
                'kategori' => 'Produk Digital',
            ])->toArray();
        $products = array_merge($products, $produkDigital);

        // Fetch Payment Link
        $paymentLink = PaymentLink::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($l) => [
                'id' => "payment_link:{$l->id}",
                'product_id' => $l->id,
                'type' => 'payment-link',
                'nama' => $l->nama,
                'harga' => $l->harga ?? 0,
                'status' => $l->status,
                'tanggal' => $l->created_at->format('d M Y H:i'),
                'terjual' => 0,
                'kategori' => 'Link Pembayaran',
            ])->toArray();
        $products = array_merge($products, $paymentLink);

        // Fetch Bootcamp
        $bootcamp = Bootcamp::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($b) => [
                'id' => "bootcamp:{$b->id}",
                'product_id' => $b->id,
                'type' => 'bootcamp',
                'nama' => $b->name,
                'harga' => $b->harga ?? 0,
                'status' => $b->status,
                'tanggal' => $b->created_at->format('d M Y H:i'),
                'terjual' => $b->pendaftaran()->count(),
                'kategori' => 'Bootcamp',
            ])->toArray();
        $products = array_merge($products, $bootcamp);

        // Fetch Coaching Mentoring
        $coachings = CoachingMentoring::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($c) => [
                'id' => "coaching_mentoring:{$c->id}",
                'product_id' => $c->id,
                'type' => 'coaching-mentoring',
                'nama' => $c->nama,
                'harga' => $c->harga ?? 0,
                'status' => $c->status,
                'tanggal' => $c->created_at->format('d M Y H:i'),
                'terjual' => $c->total_penjualan ?? 0,
                'kategori' => 'Coaching / Mentoring',
            ])->toArray();
        $products = array_merge($products, $coachings);

        // Fetch Penggalangan Dana
        $penggalanganDana = PenggalanganDana::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => [
                'id' => "penggalangan_dana:{$p->id}",
                'product_id' => $p->id,
                'type' => 'penggalangan-dana',
                'nama' => $p->nama,
                'harga' => $p->harga ?? 0,
                'status' => $p->status,
                'tanggal' => $p->created_at->format('d M Y H:i'),
                'terjual' => $p->pembeli ?? 0,
                'kategori' => 'Penggalangan Dana',
            ])->toArray();
        $products = array_merge($products, $penggalanganDana);

        // Fetch Tulisan
        $tulisan = Tulisan::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($t) => [
                'id' => "tulisan:{$t->id}",
                'product_id' => $t->id,
                'type' => 'tulisan',
                'nama' => $t->nama,
                'harga' => $t->harga ?? 0,
                'status' => $t->status,
                'tanggal' => $t->created_at->format('d M Y H:i'),
                'terjual' => $t->terjual ?? 0,
                'kategori' => 'Tulisan',
            ])->toArray();
        $products = array_merge($products, $tulisan);

        // Fetch Kelas Online
        $kelasOnline = KelasOnline::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($k) => [
                'id' => "kelas_online:{$k->id}",
                'product_id' => $k->id,
                'type' => 'kelas-online',
                'nama' => $k->nama,
                'harga' => $k->harga ?? 0,
                'status' => $k->status,
                'tanggal' => $k->created_at->format('d M Y H:i'),
                'terjual' => $k->pesertaTerdaftar()->count(),
                'kategori' => 'Kelas Online',
            ])->toArray();
        $products = array_merge($products, $kelasOnline);

        // Sort by created_at descending
        usort($products, function ($a, $b) {
            return strcmp($b['tanggal'], $a['tanggal']);
        });

        return $products;
    }
}
