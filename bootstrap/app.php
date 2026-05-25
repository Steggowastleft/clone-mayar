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

        // Bypass CSRF untuk semua route yang pakai fetch/axios dari frontend
        $middleware->validateCsrfTokens(except: [
            'login',
            'logout',
            // Auth peserta
            'peserta/login',
            'peserta/logout',
            'peserta/check-email',
            'peserta/login-checkout',
            'peserta/register-checkout',
            // Dashboard peserta
            'peserta/assignments/*',
            'peserta/assignments/*/submit',
            'peserta/assignments/*/quiz',
            'peserta/bootcamp/*',
            'peserta/bootcamp/*/materi/*/selesai',
            'peserta/bootcamp/*/rating',
            'peserta/bootcamp/*/sertifikat',
            // Daftar bootcamp
            'bootcamps/*/daftar',
            // Soal quiz (penjual)
            'assignments/*/soal',
            'assignments/*/soal/*',
        ]);

        // Alias middleware peserta & Spatie Permission
        $middleware->alias([
            'auth.peserta'  => \App\Http\Middleware\PesertaAuth::class,
            'guest.peserta' => \App\Http\Middleware\PesertaGuest::class,
            'role'          => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'    => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();