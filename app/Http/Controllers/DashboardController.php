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
        $recentTransaksi = Pembayaran::with('bootcamp')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($p) {
                return [
                    'id'    => $p->id,
                    'type'  => $p->status === 'rejected' ? 'refund' : 'income',
                    'title' => $p->bootcamp ? 'Penjualan ' . $p->bootcamp->name : 'Pembayaran #' . $p->order_id,
                    'amount' => (float) $p->jumlah,
                    'date'  => $p->created_at->locale('id')->diffForHumans(),
                ];
            });

        // Tambahkan dari Pendaftaran (non-bootcamp) jika ada harga_bayar > 0
        $recentPendaftaran = Pendaftaran::with('registrable')
            ->where('harga_bayar', '>', 0)
            ->whereNotIn('registrable_type', ['App\\Models\\Bootcamp']) // Bootcamp sudah dari Pembayaran
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($p) {
                $productName = 'Produk';
                if ($p->registrable) {
                    $productName = $p->registrable->nama
                        ?? $p->registrable->name
                        ?? class_basename($p->registrable_type);
                }
                return [
                    'id'    => 'p_' . $p->id,
                    'type'  => 'income',
                    'title' => 'Penjualan ' . $productName,
                    'amount' => (float) $p->harga_bayar,
                    'date'  => $p->created_at->locale('id')->diffForHumans(),
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
                'transactions'      => $allTransaksi->values()->toArray(),
                'reviews'           => $recentReviews->toArray(),
            ],
            'user' => [
                'name' => auth()->user()?->name ?? 'Pengguna',
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
        $bootcamps = Bootcamp::withCount([
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
            ];
        }

        // Ebook: hitung dari field terjual
        $ebooks = Ebook::where('terjual', '>', 0)
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
            ];
        }

        // ProdukDigital: hitung dari field total_penjualan
        $produkDigitals = ProdukDigital::where('total_penjualan', '>', 0)
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
            ];
        }

        // Sort semua berdasarkan sold desc, ambil top 10
        usort($products, fn($a, $b) => $b['sold'] - $a['sold']);

        return array_slice($products, 0, 10);
    }
}
