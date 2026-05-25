<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Relation::enforceMorphMap([
            'penggalangan_dana' => \App\Models\PenggalanganDana::class,
            'pendaftaran' => \App\Models\Pendaftaran::class,
            'bootcamp' => \App\Models\Bootcamp::class,
            'event' => \App\Models\Event::class,
            'webinar' => \App\Models\Webinar::class,
            'ebook' => \App\Models\Ebook::class,
            'produkdigital' => \App\Models\Produkdigital::class,
            'bundling' => \App\Models\Bundling::class,
            'user' => \App\Models\User::class,
            'kelas_online' => \App\Models\KelasOnline::class,
        ]);
    }
}
