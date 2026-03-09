<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PesertaAuth
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::guard('peserta')->check()) {
            // Simpan URL tujuan agar setelah login bisa redirect ke sana
            return redirect()->route('peserta.login')
                ->with('intended', $request->url());
        }

        return $next($request);
    }
}