<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PesertaGuest
{
    public function handle(Request $request, Closure $next)
    {
        // Kalau peserta sudah login, redirect ke dashboard peserta
        if (Auth::guard('peserta')->check()) {
            return redirect()->route('peserta.dashboard');
        }

        return $next($request);
    }
}