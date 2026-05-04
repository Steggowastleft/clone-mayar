<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    /**
     * Menampilkan daftar permohonan withdrawal
     */
    public function index()
    {
        $withdrawals = Withdrawal::with('user')
            ->latest('tanggal_permohonan')
            ->paginate(15);

        return Inertia::render('admin/withdrawal/index', [
            'withdrawals' => $withdrawals,
        ]);
    }

    /**
     * Menampilkan detail withdrawal untuk approval
     */
    public function show(Withdrawal $withdrawal)
    {
        return Inertia::render('admin/withdrawal/detail', [
            'withdrawal' => $withdrawal->load('user', 'approvedBy'),
        ]);
    }

    /**
     * Approve permohonan withdrawal
     */
    public function approve(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Status withdrawal tidak valid untuk di-approve'
            ], 422);
        }

        $validated = $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $withdrawal->update([
            'status'           => 'approved',
            'admin_notes'      => $validated['admin_notes'] ?? null,
            'tanggal_approval' => now(),
            'approved_by'      => Auth::id(),
        ]);

        // TODO: Send notification email to user
        // TODO: Auto transfer or mark for manual processing

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal berhasil di-approve'
        ]);
    }

    /**
     * Reject permohonan withdrawal
     */
    public function reject(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Status withdrawal tidak valid untuk di-reject'
            ], 422);
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        $withdrawal->update([
            'status'           => 'rejected',
            'admin_notes'      => $validated['admin_notes'],
            'tanggal_approval' => now(),
            'approved_by'      => Auth::id(),
        ]);

        // TODO: Send rejection notification email to user

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal berhasil di-reject'
        ]);
    }

    /**
     * Mark as completed
     */
    public function markCompleted(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya withdrawal yang approved yang bisa di-mark completed'
            ], 422);
        }

        $withdrawal->update([
            'status'           => 'completed',
            'tanggal_selesai'  => now(),
        ]);

        // TODO: Send completion notification email

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal berhasil ditandai selesai'
        ]);
    }

    /**
     * Statistik withdrawal
     */
    public function stats()
    {
        $stats = [
            'pending' => Withdrawal::where('status', 'pending')->sum('jumlah'),
            'approved' => Withdrawal::where('status', 'approved')->sum('jumlah'),
            'completed' => Withdrawal::where('status', 'completed')->sum('jumlah'),
            'rejected' => Withdrawal::where('status', 'rejected')->sum('jumlah'),
            'pending_count' => Withdrawal::where('status', 'pending')->count(),
            'total_processed' => Withdrawal::where('status', 'completed')->sum('jumlah'),
        ];

        return response()->json($stats);
    }
}
