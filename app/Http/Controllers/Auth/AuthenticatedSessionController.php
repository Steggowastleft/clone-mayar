<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    // =========================
    // HALAMAN LOGIN
    // =========================
    public function create(): Response
    {
        return Inertia::render('Auth/login', [
            'canResetPassword' => false,
            'status' => session('status'),
        ]);
    }

    // =========================
    // PROSES LOGIN
    // =========================
public function store(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($request->only('email', 'password'), $request->filled('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        // Determine redirect based on role
        $user = Auth::user();
        $redirect = '/dashboard';
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('admin')) {
            $redirect = '/admin/dashboard';
        }

        Log::info('User login redirect', [
            'id'    => $user->id,
            'email' => $user->email,
            'role'  => $user->role ?? 'unknown',
            'to'    => $redirect,
        ]);

        return redirect($redirect);
    }

    // =========================
    // LOGOUT
    // =========================
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
