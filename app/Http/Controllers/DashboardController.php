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
use App\Models\Bundling;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        $timeRange = request('timeRange', '7');
        $days      = (int) $timeRange;

        $now       = Carbon::now();
        $startCurr = $now->copy()->subDays($days)->startOfDay();
        $startPrev = $now->copy()->subDays($days * 2)->startOfDay();
        $endPrev   = $now->copy()->subDays($days)->endOfDay();

        // ── Total Pendapatan (dari Pembayaran confirmed) ─────────────────
        $revenueCurr = $this->queryUserPembayaran($userId)->where('status', 'confirmed')
            ->whereBetween('confirmed_at', [$startCurr, $now])
            ->sum('jumlah');

        $revenuePrev = $this->queryUserPembayaran($userId)->where('status', 'confirmed')
            ->whereBetween('confirmed_at', [$startPrev, $endPrev])
            ->sum('jumlah');

        $revenueTrend = $this->calcTrend($revenuePrev, $revenueCurr);

        // ── Total Transaksi (Pendaftaran aktif + pending) ─────────────────
        $transaksiCurr = $this->queryUserPendaftaran($userId)->whereBetween('created_at', [$startCurr, $now])->count()
            + \App\Models\KelasOnlinePeserta::whereIn('kelas_online_id', KelasOnline::where('user_id', $userId)->pluck('id'))
                ->whereBetween('created_at', [$startCurr, $now])
                ->count();
                
        $transaksiPrev = $this->queryUserPendaftaran($userId)->whereBetween('created_at', [$startPrev, $endPrev])->count()
            + \App\Models\KelasOnlinePeserta::whereIn('kelas_online_id', KelasOnline::where('user_id', $userId)->pluck('id'))
                ->whereBetween('created_at', [$startPrev, $endPrev])
                ->count();
                
        $transaksiTrend = $this->calcTrend($transaksiPrev, $transaksiCurr);

        // ── Pembayaran Belum Dikonfirmasi ─────────────────────────────────
        $pendingPayment = $this->queryUserPembayaran($userId)->where('status', 'pending')->sum('jumlah');

        // ── Saldo Akun (semua pembayaran confirmed dikurangi withdrawal) ─
        $totalPayments = $this->queryUserPembayaran($userId)->where('status', 'confirmed')->sum('jumlah');
        $totalWithdrawn = \App\Models\Withdrawal::where('user_id', $userId)
            ->whereIn('status', ['approved', 'completed', 'pending'])
            ->sum('jumlah');
        $totalBalance = max(0, $totalPayments - $totalWithdrawn);

        // ── Total Produk (semua tabel) ────────────────────────────────────
        $totalProduk = Bootcamp::where('user_id', $userId)->count()
            + Webinar::where('user_id', $userId)->count()
            + Event::where('user_id', $userId)->count()
            + Ebook::where('user_id', $userId)->count()
            + ProdukDigital::where('user_id', $userId)->count()
            + CoachingMentoring::where('user_id', $userId)->count()
            + PenggalanganDana::where('user_id', $userId)->count()
            + PaymentLink::where('user_id', $userId)->count()
            + Tulisan::where('user_id', $userId)->count()
            + KelasOnline::where('user_id', $userId)->count();

        // ── Total Pelanggan unik ──────────────────────────────────────────
        $userPesertaIds = $this->queryUserPendaftaran($userId)->pluck('peserta_id')
            ->concat(
                \App\Models\KelasOnlinePeserta::whereIn(
                    'kelas_online_id',
                    KelasOnline::where('user_id', $userId)->pluck('id')
                )->pluck('peserta_id')
            )
            ->unique()
            ->filter();
        
        $totalPelanggan = $userPesertaIds->count();

        // ── Chart Data (pendapatan & transaksi per hari) ──────────────────
        $chartData = $this->buildChartData($days, $now, $userId);

        // ── Produk Terlaris (dari Pendaftaran, group by registrable_type+id) ─
        $topProducts = $this->getTopProducts($userId);

        // ── Transaksi Terbaru (Pembayaran terbaru, 5 data) ───────────────
        $recentTransaksi = $this->queryUserPembayaran($userId)->with(['bootcamp.user', 'peserta'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($p) {
                $buyer = $p->nama_pembeli ?: ($p->peserta?->nama ?: 'Pengguna');
                $productName = $p->bootcamp ? $p->bootcamp->name : ('Pembayaran #' . $p->order_id);
                $action = "Membeli Bootcamp " . $productName;
                return [
                    'id'          => $p->id,
                    'type'        => $p->status === 'rejected' ? 'refund' : 'income',
                    'buyerName'   => $buyer,
                    'actionText'  => $action,
                    'avatar'      => $p->peserta?->foto_url,
                    'amount'      => (float) $p->jumlah,
                    'date'        => $p->created_at->locale('id')->diffForHumans(),
                    'timestamp'   => $p->created_at->timestamp,
                ];
            });

        // Tambahkan dari Pendaftaran (non-bootcamp) jika ada harga_bayar > 0
        $recentPendaftaran = $this->queryUserPendaftaran($userId)->with(['registrable.user', 'peserta'])
            ->whereNotIn('registrable_type', ['App\\Models\\Bootcamp']) // Bootcamp sudah dari Pembayaran
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($p) {
                $buyer = $p->peserta?->nama ?: 'Pengguna';
                $productName = 'Produk';
                $type = 'Produk';
                if ($p->registrable) {
                    $productName = $p->registrable->nama
                        ?? $p->registrable->name
                        ?? class_basename($p->registrable_type);
                    $type = class_basename($p->registrable_type);
                }
                
                // Format action text based on class type to match screenshot
                if ($type === 'PenggalanganDana') {
                    $action = 'Menyumbang di Penggalangan Dana "' . $productName . '"';
                } elseif ($type === 'Event') {
                    $action = "Membeli Tiket Event " . $productName;
                } elseif ($type === 'KelasOnline' || $type === 'kelasonline') {
                    $action = "Membeli Kelas " . $productName;
                } elseif ($type === 'Webinar') {
                    $action = "Membeli Webinar " . $productName;
                } elseif ($type === 'ProdukDigital' || $type === 'Produkdigital') {
                    $action = "Membeli Produk " . $productName;
                } else {
                    $action = "Membeli " . $productName;
                }

                return [
                    'id'          => 'p_' . $p->id,
                    'type'        => 'income',
                    'buyerName'   => $buyer,
                    'actionText'  => $action,
                    'avatar'      => $p->peserta?->foto_url,
                    'amount'      => (float) $p->harga_bayar,
                    'date'        => $p->created_at->locale('id')->diffForHumans(),
                    'timestamp'   => $p->created_at->timestamp,
                ];
            });

        $allTransaksi = $recentTransaksi->concat($recentPendaftaran)
            ->sortByDesc(fn($t) => $t['timestamp'])
            ->values()
            ->take(10);

        // ── Ulasan / Rating Terbaru ───────────────────────────────────────
        $recentReviews = Rating::where(function ($query) use ($userId) {
            $query->whereIn('bootcamp_id', Bootcamp::where('user_id', $userId)->pluck('id'))
                  ->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', Bootcamp::class)
                        ->whereIn('rateable_id', Bootcamp::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', Webinar::class)
                        ->whereIn('rateable_id', Webinar::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', Event::class)
                        ->whereIn('rateable_id', Event::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', Ebook::class)
                        ->whereIn('rateable_id', Ebook::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', ProdukDigital::class)
                        ->whereIn('rateable_id', ProdukDigital::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', CoachingMentoring::class)
                        ->whereIn('rateable_id', CoachingMentoring::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', Tulisan::class)
                        ->whereIn('rateable_id', Tulisan::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', Bundling::class)
                        ->whereIn('rateable_id', Bundling::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', PaymentLink::class)
                        ->whereIn('rateable_id', PaymentLink::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', PenggalanganDana::class)
                        ->whereIn('rateable_id', PenggalanganDana::where('user_id', $userId)->pluck('id'));
                  })->orWhere(function ($q) use ($userId) {
                      $q->where('rateable_type', KelasOnline::class)
                        ->whereIn('rateable_id', KelasOnline::where('user_id', $userId)->pluck('id'));
                  });
        })->with(['bootcamp', 'peserta'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($r) {
                $productName = 'Produk';
                if ($r->bootcamp) {
                    $productName = $r->bootcamp->name;
                } elseif ($r->rateable) {
                    $productName = $r->rateable->nama ?? $r->rateable->name ?? class_basename($r->rateable_type);
                }
                return [
                    'id'          => $r->id,
                    'productName' => $productName,
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

        // ── Dynamic Trend Calculations for Summary Cards ──
        $startOfMonth = Carbon::now()->startOfMonth();
        $startOfLastMonth = Carbon::now()->startOfMonth()->subMonth();
        $endOfLastMonth = Carbon::now()->startOfMonth()->subMonth()->endOfMonth();
        $startOfToday = Carbon::now()->startOfDay();

        // 1. Saldo Akun Trend (Cumulative balance at end of last month vs current balance)
        $paymentsLastMonthCumulative = $this->queryUserPembayaran($userId)->where('status', 'confirmed')
            ->where('confirmed_at', '<=', $endOfLastMonth)
            ->sum('jumlah');
        $withdrawnLastMonthCumulative = \App\Models\Withdrawal::where('user_id', $userId)
            ->whereIn('status', ['approved', 'completed', 'pending'])
            ->where('created_at', '<=', $endOfLastMonth)
            ->sum('jumlah');
        $balLastMonthCumulative = max(0, $paymentsLastMonthCumulative - $withdrawnLastMonthCumulative);

        $balanceTrendVal = $this->calcTrend($balLastMonthCumulative, $totalBalance);

        // 2. Total Pendapatan Trend (This month revenue vs last month revenue)
        $revCurrMonth = $this->queryUserPembayaran($userId)->where('status', 'confirmed')
            ->whereBetween('confirmed_at', [$startOfMonth, $now])
            ->sum('jumlah');
        $revLastMonth = $this->queryUserPembayaran($userId)->where('status', 'confirmed')
            ->whereBetween('confirmed_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('jumlah');
        $revenueTrendVal = $this->calcTrend($revLastMonth, $revCurrMonth);

        // 3. Transactions Today (Today's count)
        $transactionsTodayCount = $this->queryUserPendaftaran($userId)
            ->where('created_at', '>=', $startOfToday)
            ->count()
            + \App\Models\KelasOnlinePeserta::whereIn('kelas_online_id', KelasOnline::where('user_id', $userId)->pluck('id'))
                ->where('created_at', '>=', $startOfToday)
                ->count();

        // 4. Pending Payments Today (Today's count)
        $pendingPaymentsTodayCount = $this->queryUserPembayaran($userId)
            ->where('status', 'pending')
            ->where('created_at', '>=', $startOfToday)
            ->count();

        $totalTransactionsAllTime = $this->queryUserPendaftaran($userId)->count()
            + \App\Models\KelasOnlinePeserta::whereIn('kelas_online_id', KelasOnline::where('user_id', $userId)->pluck('id'))->count();

        return Inertia::render('dashboard/index', [
            'dashboardData' => [
                'balance'              => (float) $totalBalance,
                'totalRevenue'         => (float) $totalPayments,
                'totalTransactions'    => (int) $totalTransactionsAllTime,
                'pendingPayment'       => (float) $pendingPayment,
                'pendingPaymentCount'  => (int) $this->queryUserPembayaran($userId)->where('status', 'pending')->count(),
                'balanceTrend'         => $balanceTrendVal,
                'revenueTrend'         => $revenueTrendVal,
                'transactionsToday'    => (int) $transactionsTodayCount,
                'pendingPaymentsToday' => (int) $pendingPaymentsTodayCount,
                'chartData'            => $chartData,
                'products'             => $topProducts,
                'allProducts'          => $this->getAllProducts(),
                'transactions'         => $allTransaksi->values()->toArray(),
                'reviews'              => $recentReviews->toArray(),
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
    private function buildChartData(int $days, Carbon $now, $userId): array
    {
        $start = $now->copy()->subDays($days - 1)->startOfDay();

        // Ambil pendapatan per hari dari Pembayaran confirmed milik user
        $pembayaranPerHari = $this->queryUserPembayaran($userId)->where('status', 'confirmed')
            ->where('confirmed_at', '>=', $start)
            ->select(
                DB::raw('DATE(confirmed_at) as tanggal'),
                DB::raw('SUM(jumlah) as total')
            )
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        // Ambil transaksi per hari dari Pendaftaran milik user
        $pendaftaranPerHari = $this->queryUserPendaftaran($userId)->where('created_at', '>=', $start)
            ->select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        // Ambil transaksi per hari dari KelasOnlinePeserta milik user
        $kelasPesertaPerHari = \App\Models\KelasOnlinePeserta::whereIn(
            'kelas_online_id',
            KelasOnline::where('user_id', $userId)->pluck('id')
        )->where('created_at', '>=', $start)
            ->select(
                DB::raw('DATE(created_at) as tanggal'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        $dayMap = [
            0 => 'Mingg',
            1 => 'Sen',
            2 => 'Sel',
            3 => 'Rab',
            4 => 'Kam',
            5 => 'Jum',
            6 => 'Sab',
        ];

        $chartData = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $carbonDate = $now->copy()->subDays($i);
            $date = $carbonDate->format('Y-m-d');
            
            if ($days === 7) {
                $label = $dayMap[$carbonDate->dayOfWeek];
            } else {
                $label = $carbonDate->format('d/m');
            }

            $pendaftaranCount = (int) ($pendaftaranPerHari[$date] ?? 0);
            $kelasCount = (int) ($kelasPesertaPerHari[$date] ?? 0);

            $chartData[] = [
                'date'       => $label,
                'pendapatan' => (float) ($pembayaranPerHari[$date] ?? 0),
                'transaksi'  => $pendaftaranCount + $kelasCount,
            ];
        }

        return $chartData;
    }

    // ── Ambil produk terlaris ──────────────────────────────────────────────
    private function getTopProducts($userId): array
    {
        $products = [];

        // Bootcamp: hitung dari Pendaftaran
        $bootcamps = Bootcamp::where('user_id', $userId)
            ->with('user')
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
        $ebooks = Ebook::where('user_id', $userId)
            ->with('user')
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
        $produkDigitals = ProdukDigital::where('user_id', $userId)
            ->with('user')
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

    // ── Helper query pembayaran & pendaftaran user ────────────────────────
    private function queryUserPembayaran($userId)
    {
        $bootcampIds = \App\Models\Bootcamp::where('user_id', $userId)->pluck('id');
        
        $kelasOrderIds = \App\Models\KelasOnlinePeserta::whereIn(
            'kelas_online_id',
            \App\Models\KelasOnline::where('user_id', $userId)->pluck('id')
        )->pluck('order_id')->filter();

        $pendaftaranOrderIds = \App\Models\Pendaftaran::where(function ($query) use ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Bootcamp::class)
                  ->whereIn('registrable_id', \App\Models\Bootcamp::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Webinar::class)
                  ->whereIn('registrable_id', \App\Models\Webinar::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Event::class)
                  ->whereIn('registrable_id', \App\Models\Event::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Ebook::class)
                  ->whereIn('registrable_id', \App\Models\Ebook::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Produkdigital::class)
                  ->whereIn('registrable_id', \App\Models\Produkdigital::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\CoachingMentoring::class)
                  ->whereIn('registrable_id', \App\Models\CoachingMentoring::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Tulisan::class)
                  ->whereIn('registrable_id', \App\Models\Tulisan::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Bundling::class)
                  ->whereIn('registrable_id', \App\Models\Bundling::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\PaymentLink::class)
                  ->whereIn('registrable_id', \App\Models\PaymentLink::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\PenggalanganDana::class)
                  ->whereIn('registrable_id', \App\Models\PenggalanganDana::where('user_id', $userId)->pluck('id'));
            });
        })->pluck('order_id')->filter();

        $orderIds = $kelasOrderIds->concat($pendaftaranOrderIds)->unique()->toArray();

        return \App\Models\Pembayaran::where(function ($q) use ($bootcampIds, $orderIds) {
            $q->whereIn('bootcamp_id', $bootcampIds);
            if (!empty($orderIds)) {
                $q->orWhereIn('order_id', $orderIds);
            }
        });
    }

    private function queryUserPendaftaran($userId)
    {
        return \App\Models\Pendaftaran::where(function ($query) use ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Bootcamp::class)
                  ->whereIn('registrable_id', \App\Models\Bootcamp::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Webinar::class)
                  ->whereIn('registrable_id', \App\Models\Webinar::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Event::class)
                  ->whereIn('registrable_id', \App\Models\Event::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Ebook::class)
                  ->whereIn('registrable_id', \App\Models\Ebook::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Produkdigital::class)
                  ->whereIn('registrable_id', \App\Models\Produkdigital::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\CoachingMentoring::class)
                  ->whereIn('registrable_id', \App\Models\CoachingMentoring::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Tulisan::class)
                  ->whereIn('registrable_id', \App\Models\Tulisan::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\Bundling::class)
                  ->whereIn('registrable_id', \App\Models\Bundling::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\PaymentLink::class)
                  ->whereIn('registrable_id', \App\Models\PaymentLink::where('user_id', $userId)->pluck('id'));
            })->orWhere(function ($q) use ($userId) {
                $q->where('registrable_type', \App\Models\PenggalanganDana::class)
                  ->whereIn('registrable_id', \App\Models\PenggalanganDana::where('user_id', $userId)->pluck('id'));
            });
        });
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
