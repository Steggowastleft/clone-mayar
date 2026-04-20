<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Inertia
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Bypass CSRF sementara
        // Inertia handles CSRF via X-XSRF-TOKEN cookie automatically
        // Only need to bypass for non-Inertia endpoints
        $middleware->validateCsrfTokens(except: [
            'login',
            'logout',
            'peserta/check-email',
            'peserta/login-checkout',
            'peserta/register-checkout',
            'peserta/bootcamp/*/rating',
            'assignments/*/soal',
            'assignments/*/soal/*',
            'bootcamps/*/daftar',
            'peserta/login',
            'peserta/logout',
        ]);

        // Alias middleware peserta — DIGABUNG di sini, bukan ->withMiddleware kedua
        $middleware->alias([
            'auth.peserta'  => \App\Http\Middleware\PesertaAuth::class,
            'guest.peserta' => \App\Http\Middleware\PesertaGuest::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();