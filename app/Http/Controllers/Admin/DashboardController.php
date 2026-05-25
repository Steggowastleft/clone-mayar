<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AccountVerification;
use App\Models\Withdrawal;
use App\Models\ProdukDigital;
use App\Models\Bootcamp;
use App\Models\KelasOnline;
use App\Models\Webinar;
use App\Models\Pendaftaran;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $totalUsers = User::count();
        $pendingVerificationsCount = AccountVerification::where('status', 'pending')->count();
        $pendingVerifications = AccountVerification::with('user')
            ->where('status', 'pending')
            ->latest('submitted_at')
            ->limit(6)
            ->get();

        $pendingWithdrawalsCount = Withdrawal::where('status', 'pending')->count();
        $pendingWithdrawalsSum = Withdrawal::where('status', 'pending')->sum('jumlah');
        $pendingWithdrawals = Withdrawal::with('user')
            ->where('status', 'pending')
            ->latest('tanggal_permohonan')
            ->limit(6)
            ->get();

        // ── Transactions over time (Last 7 Days) ──
        $now = Carbon::now();
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $label = $date->format('d M');
            
            $count = Pendaftaran::whereDate('created_at', $dateStr)->count();
            
            $chartData[] = [
                'date' => $label,
                'transactions' => $count,
            ];
        }

        $totalTransactions = Pendaftaran::count();

        // ── Top Sellers ──
        $users = User::all();
        $sellers = [];
        foreach ($users as $u) {
            // Count of digital products sales
            $digitalSales = (int) ProdukDigital::where('user_id', $u->id)->sum('total_penjualan');
            
            // Count of bootcamp registrations
            $bootcampSales = Pendaftaran::where('status', 'aktif')
                ->where('registrable_type', 'App\\Models\\Bootcamp')
                ->whereIn('registrable_id', Bootcamp::where('user_id', $u->id)->pluck('id'))
                ->count();
                
            // Count of webinar registrations
            $webinarSales = Pendaftaran::where('status', 'aktif')
                ->where('registrable_type', 'App\\Models\\Webinar')
                ->whereIn('registrable_id', Webinar::where('user_id', $u->id)->pluck('id'))
                ->count();
                
            // Count of online class registrations
            $kelasSales = Pendaftaran::where('status', 'aktif')
                ->where('registrable_type', 'App\\Models\\KelasOnline')
                ->whereIn('registrable_id', KelasOnline::where('user_id', $u->id)->pluck('id'))
                ->count();
            
            $totalSales = $digitalSales + $bootcampSales + $webinarSales + $kelasSales;
            
            if ($totalSales > 0) {
                $sellers[] = [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'total_sales' => $totalSales,
                ];
            }
        }
        usort($sellers, fn($a, $b) => $b['total_sales'] - $a['total_sales']);
        $topSellers = array_slice($sellers, 0, 5);

        // ── Best-Selling Products ──
        $products = [];
        
        // Bootcamp
        $bootcamps = Bootcamp::with('user')
            ->withCount(['pendaftaran as total_terjual' => function ($q) {
                $q->where('status', 'aktif');
            }])
            ->having('total_terjual', '>', 0)
            ->get();
        foreach ($bootcamps as $b) {
            $products[] = [
                'name' => $b->name,
                'type' => 'Bootcamp',
                'sold' => (int) $b->total_terjual,
                'creator' => $b->user?->name ?? 'Admin',
            ];
        }
        
        // Digital Product
        $digitals = ProdukDigital::with('user')
            ->where('total_penjualan', '>', 0)
            ->get();
        foreach ($digitals as $d) {
            $products[] = [
                'name' => $d->nama,
                'type' => 'Digital Product',
                'sold' => (int) $d->total_penjualan,
                'creator' => $d->user?->name ?? 'Admin',
            ];
        }
        
        // Online Class (Kelas Online)
        $kelas = KelasOnline::with('owner')
            ->withCount(['pendaftaran as total_terjual' => function ($q) {
                $q->where('status', 'aktif');
            }])
            ->having('total_terjual', '>', 0)
            ->get();
        foreach ($kelas as $k) {
            $products[] = [
                'name' => $k->nama,
                'type' => 'Online Class',
                'sold' => (int) $k->total_terjual,
                'creator' => $k->owner?->name ?? 'Admin',
            ];
        }
        
        // Webinar
        $webinars = Webinar::with('user')
            ->withCount(['pendaftaran as total_terjual' => function ($q) {
                $q->where('status', 'aktif');
            }])
            ->having('total_terjual', '>', 0)
            ->get();
        foreach ($webinars as $w) {
            $products[] = [
                'name' => $w->nama,
                'type' => 'Webinar',
                'sold' => (int) $w->total_terjual,
                'creator' => $w->user?->name ?? 'Admin',
            ];
        }

        usort($products, fn($a, $b) => $b['sold'] - $a['sold']);
        $bestSellingProducts = array_slice($products, 0, 5);

        return Inertia::render('adminpanel/Dashboard', [
            'user' => [
                'name' => $user?->name,
            ],
            'stats' => [
                'total_users' => $totalUsers,
                'pending_verifications_count' => $pendingVerificationsCount,
                'pending_withdrawals_count' => $pendingWithdrawalsCount,
                'pending_withdrawals_sum' => $pendingWithdrawalsSum,
                'total_transactions' => $totalTransactions,
            ],
            'chartData' => $chartData,
            'topSellers' => $topSellers,
            'bestSellingProducts' => $bestSellingProducts,
            'verifications' => $pendingVerifications,
            'withdrawals' => $pendingWithdrawals,
        ]);
    }
}
