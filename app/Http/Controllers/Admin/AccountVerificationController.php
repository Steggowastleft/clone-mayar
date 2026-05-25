<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AccountVerification;
use Illuminate\Support\Facades\Auth;

class AccountVerificationController extends Controller
{
    protected function ensureAdmin()
    {
        $user = Auth::user();
        if (! $user || ! method_exists($user, 'hasRole') || ! $user->hasRole('admin')) {
            abort(403);
        }
    }

    // Render the Inertia admin verifications page
    public function index(Request $request)
    {
        $this->ensureAdmin();

        $verifications = AccountVerification::with(['user', 'documents'])
            ->latest('submitted_at')
            ->paginate(25);

        return Inertia::render('adminpanel/Verifications', [
            'verifications' => $verifications,
        ]);
    }

    // Approve via POST /admin/verifikasi/{verification}/approve
    public function approve(Request $request, AccountVerification $verification)
    {
        $this->ensureAdmin();

        if ($verification->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Status tidak valid'], 422);
        }

        $verification->update([
            'status' => 'approved',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }

    // Reject via POST /admin/verifikasi/{verification}/reject
    public function reject(Request $request, AccountVerification $verification)
    {
        $this->ensureAdmin();

        $data = $request->validate(['decline_reason' => 'required|string|max:500']);

        if ($verification->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Status tidak valid'], 422);
        }

        $verification->update([
            'status' => 'rejected',
            'decline_reason' => $data['decline_reason'],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }
}
