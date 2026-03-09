<?php

namespace App\Http\Controllers\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Peserta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PesertaAuthController extends Controller
{
    // ── Login ─────────────────────────────────────────────
    public function showLogin(Request $request)
    {
        return Inertia::render('Peserta/auth/login', [
            // Kirim redirect_to ke frontend agar bisa diteruskan setelah login
            'redirectTo' => $request->query('redirect', '/peserta/dashboard'),
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Pastikan bukan akun admin yang coba login di sini
        if (!Auth::guard('peserta')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            return back()->withErrors([
                'email' => 'Email atau password salah. Pastikan kamu menggunakan akun peserta.',
            ]);
        }

        $request->session()->regenerate();

        // Redirect ke halaman yang diminta, default dashboard
        $redirectTo = $request->input('redirect_to', '/peserta/dashboard');
        return redirect($redirectTo);
    }

    // ── Register ──────────────────────────────────────────
    public function showRegister(Request $request)
    {
        return Inertia::render('Peserta/auth/register', [
            'redirectTo' => $request->query('redirect', '/peserta/dashboard'),
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nama'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:peserta,email',
            'no_hp'                 => 'nullable|string|max:20',
            'password'              => ['required', 'confirmed', Password::min(8)],
        ]);

        $peserta = Peserta::create([
            'nama'     => $request->nama,
            'email'    => $request->email,
            'no_hp'    => $request->no_hp,
            'password' => Hash::make($request->password),
        ]);

        Auth::guard('peserta')->login($peserta);
        $request->session()->regenerate();

        $redirectTo = $request->input('redirect_to', '/peserta/dashboard');
        return redirect($redirectTo);
    }

    // ── Logout ────────────────────────────────────────────
    public function logout(Request $request)
    {
        Auth::guard('peserta')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}