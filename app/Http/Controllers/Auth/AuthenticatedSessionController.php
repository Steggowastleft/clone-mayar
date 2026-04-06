<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

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
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (!Auth::attempt($credentials)) {
        return back()->withErrors([
            'email' => 'Email atau password salah',
        ]);
    }

    $request->session()->regenerate();

    // 🔥 PENTING: HARUS RETURN REDIRECT
    return redirect('/dashboard');
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