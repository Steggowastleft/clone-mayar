<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Withdrawal;
use App\Models\AccountVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CreatorWithdrawalController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Calculate available balance
        $totalPayments = $this->queryUserPembayaran($user->id)->where('status', 'confirmed')->sum('jumlah');
        
        $totalWithdrawn = Withdrawal::where('user_id', $user->id)
            ->whereIn('status', ['approved', 'completed', 'pending']) // subtract pending too to prevent double request
            ->sum('jumlah');

        $balance = max(0, $totalPayments - $totalWithdrawn);

        // Get past withdrawals
        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->latest('tanggal_permohonan')
            ->get();

        // Get KYC verification status
        $verificationStatus = AccountVerification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->value('status') ?? 'unverified';

        return Inertia::render('pengaturan/withdrawal', [
            'user' => [
                'name'                => $user->name,
                'email'               => $user->email,
                'bank_provider'       => $user->bank_provider,
                'bank_account_number' => $user->bank_account_number,
                'bank_account_name'   => $user->bank_account_name,
            ],
            'balance'             => (float) $balance,
            'totalWithdrawn'      => (float) $totalWithdrawn,
            'verificationStatus'  => $verificationStatus,
            'withdrawals'         => $withdrawals,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        // 1. Check KYC verification status
        $verificationStatus = AccountVerification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->value('status') ?? 'unverified';

        if ($verificationStatus !== 'approved') {
            return redirect()->back()->withErrors([
                'jumlah' => 'Akun Anda belum terverifikasi. Selesaikan verifikasi KYC terlebih dahulu di menu Pengaturan Akun.'
            ]);
        }

        // 2. Check if bank credentials are configured
        if (empty($user->bank_provider) || empty($user->bank_account_number) || empty($user->bank_account_name)) {
            return redirect()->back()->withErrors([
                'jumlah' => 'Silakan lengkapi informasi rekening bank Anda terlebih dahulu di menu Pengaturan Akun -> Rekening.'
            ]);
        }

        // 3. Calculate current balance
        $totalPayments = $this->queryUserPembayaran($user->id)->where('status', 'confirmed')->sum('jumlah');
        $totalWithdrawn = Withdrawal::where('user_id', $user->id)
            ->whereIn('status', ['approved', 'completed', 'pending'])
            ->sum('jumlah');
        $balance = max(0, $totalPayments - $totalWithdrawn);

        // 4. Validate request amount
        $request->validate([
            'jumlah'  => 'required|numeric|min:50000|max:' . $balance,
            'catatan' => 'nullable|string|max:500',
        ], [
            'jumlah.min' => 'Batas minimum penarikan adalah Rp 50.000.',
            'jumlah.max' => 'Jumlah penarikan melebihi saldo aktif Anda (Rp ' . number_format($balance, 0, ',', '.') . ').',
        ]);

        // 5. Create Withdrawal record
        Withdrawal::create([
            'user_id'               => $user->id,
            'jumlah'                => $request->jumlah,
            'metode_pembayaran'     => 'bank_transfer',
            'nomor_rekening'        => $user->bank_account_number,
            'nama_pemilik_rekening' => $user->bank_account_name,
            'bank_name'             => $user->bank_provider,
            'status'                => 'pending',
            'catatan'               => $request->catatan,
            'tanggal_permohonan'    => now(),
        ]);

        return redirect()->back()->with('success', 'Permohonan penarikan dana berhasil diajukan dan sedang ditinjau.');
    }

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
}
