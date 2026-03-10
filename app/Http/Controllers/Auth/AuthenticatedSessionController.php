<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AuthenticatedSessionController extends Controller
{
    // Tampilkan halaman login
    public function create(): Response
    {
        Log::info('Displaying login page');
        return Inertia::render('Auth/login', [
            'canResetPassword' => false,
            'status' => session('status'),
        ]);
    }

    // Proses login
    public function store(Request $request)
    {
        Log::info('Login attempt', ['email' => $request->email]);

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        Log::info('Credentials validated', $credentials);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            Log::info('Login success', ['user_id' => Auth::id()]);

            // redirect ke bootcamps
            return redirect()->intended('/bootcamps');
        }

        Log::warning('Login failed', ['email' => $request->email]);

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    // Logout
    public function destroy(Request $request): RedirectResponse
    {
        Log::info('Logout attempt', ['user_id' => Auth::id()]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}