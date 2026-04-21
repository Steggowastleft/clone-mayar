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
        try {
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Data tidak valid',
                'errors'  => $e->errors(),
            ], 422);
        }

        if (!Auth::guard('peserta')->attempt([
            'email'    => $request->email,
            'password' => $request->password,
        ])) {
            return response()->json([
                'message' => 'Email atau password salah.',
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
        // Validasi request dengan custom messages
        try {
            $validated = $request->validate([
                'email'    => 'required|email|unique:peserta,email',
                'nama'     => 'required|string|max:255',
                'password' => ['required', Password::min(8)],
            ], [
                'email.required'   => 'Email wajib diisi.',
                'email.email'      => 'Format email tidak valid.',
                'email.unique'     => 'Email ini sudah terdaftar. Silakan gunakan email lain atau login dengan akun yang ada.',
                'nama.required'    => 'Nama lengkap wajib diisi.',
                'nama.max'         => 'Nama tidak boleh lebih dari 255 karakter.',
                'password.required' => 'Password wajib diisi.',
                'password.min'     => 'Password minimal harus 8 karakter.',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::info('Validation error:', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $e->errors(),
            ], 422);
        }

        try {
            $peserta = Peserta::create([
                'nama'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);

            Auth::guard('peserta')->login($peserta);
            $request->session()->regenerate();

            \Log::info('Peserta registered successfully:', ['peserta_id' => $peserta->id, 'email' => $peserta->email]);

            return response()->json([
                'success' => true,
                'peserta' => [
                    'id'    => $peserta->id,
                    'nama'  => $peserta->nama,
                    'email' => $peserta->email,
                    'no_hp' => $peserta->no_hp,
                ],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Register checkout error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat membuat akun. Silakan coba lagi.',
                'debug'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
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