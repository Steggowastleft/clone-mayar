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
    /**
     * Cek apakah email sudah terdaftar sebagai peserta.
     * Dipanggil dari CheckoutDialog step 1.
     */
    public function checkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $exists = Peserta::where('email', $request->email)->exists();

        return response()->json(['exists' => $exists]);
    }

    /**
     * Login peserta yang sudah ada — dari dalam checkout dialog.
     * Tidak redirect, langsung return JSON + set session.
     */
    public function loginCheckout(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::guard('peserta')->attempt([
            'email'    => $request->email,
            'password' => $request->password,
        ])) {
            return response()->json([
                'message' => 'Password salah. Coba lagi.',
            ], 401);
        }

        $request->session()->regenerate();
        $peserta = Auth::guard('peserta')->user();

        return response()->json([
            'peserta' => [
                'id'    => $peserta->id,
                'nama'  => $peserta->nama,
                'email' => $peserta->email,
                'no_hp' => $peserta->no_hp,
            ],
        ]);
    }

    /**
     * Register peserta baru — dari dalam checkout dialog.
     * Langsung login setelah register.
     */
    public function registerCheckout(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|unique:peserta,email',
            'nama'     => 'required|string|max:255',
            'password' => ['required', Password::min(8)],
        ]);

        $peserta = Peserta::create([
            'nama'     => $request->nama,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::guard('peserta')->login($peserta);
        $request->session()->regenerate();

        return response()->json([
            'peserta' => [
                'id'    => $peserta->id,
                'nama'  => $peserta->nama,
                'email' => $peserta->email,
                'no_hp' => $peserta->no_hp,
            ],
        ], 201);
    }

    /**
     * Login halaman terpisah — untuk peserta yang mau akses dashboard
     * langsung tanpa lewat checkout.
     */
    public function showLogin(Request $request)
    {
        return Inertia::render('Peserta/auth/login', [
            'redirectTo' => $request->query('redirect', '/peserta/dashboard'),
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::guard('peserta')->attempt(
            $request->only('email', 'password'),
            $request->boolean('remember')
        )) {
            return back()->withErrors([
                'email' => 'Email atau password salah.',
            ]);
        }

        $request->session()->regenerate();

        $redirectTo = $request->input('redirect_to', '/peserta/dashboard');
        return redirect($redirectTo);
    }

    /**
     * Logout peserta.
     */
    public function logout(Request $request)
    {
        Auth::guard('peserta')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}