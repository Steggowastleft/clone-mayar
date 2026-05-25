<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index()
    {
        $withdrawals = Withdrawal::with('user')
            ->latest('tanggal_permohonan')
            ->limit(15)
            ->get();

        return Inertia::render('adminpanel/Withdrawals', [
            'withdrawals' => $withdrawals,
        ]);
    }

    public function show(Withdrawal $withdrawal)
    {
        return Inertia::render('admin/withdrawal/detail', [
            'withdrawal' => $withdrawal->load('user', 'approvedBy'),
        ]);
    }

    public function approve(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Status invalid'], 422);
        }

        $validated = $request->validate(['admin_notes' => 'nullable|string|max:500']);

        $withdrawal->update([
            'status' => 'approved',
            'admin_notes' => $validated['admin_notes'] ?? null,
            'tanggal_approval' => now(),
            'approved_by' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function reject(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Status invalid'], 422);
        }

        $validated = $request->validate(['admin_notes' => 'required|string|max:500']);

        $withdrawal->update([
            'status' => 'rejected',
            'admin_notes' => $validated['admin_notes'],
            'tanggal_approval' => now(),
            'approved_by' => Auth::id(),
        ]);

        return response()->json(['success' => true]);
    }

    public function markCompleted(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'approved') {
            return response()->json(['success' => false, 'message' => 'Status invalid'], 422);
        }

        $withdrawal->update(['status' => 'completed', 'tanggal_selesai' => now()]);

        return response()->json(['success' => true]);
    }

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
