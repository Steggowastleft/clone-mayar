<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $peserta = auth()->guard('peserta')->user();
        
        $role = null;
        if ($user) {
            $role = method_exists($user, 'hasRole') && $user->hasRole('admin') ? 'admin' : 'creator';
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), ['role' => $role]) : null,
                'peserta' => $peserta ? $peserta->toArray() : null,
            ],
            'sidebarBadgeCounts' => function () use ($user, $role) {
                if (!$user || $role !== 'creator') {
                    return null;
                }
                $userId = $user->id;

                $bootcampIds = \App\Models\Bootcamp::where('user_id', $userId)->pluck('id');
                $kelasOrderIds = \App\Models\KelasOnlinePeserta::whereIn(
                    'kelas_online_id',
                    \App\Models\KelasOnline::where('user_id', $userId)->pluck('id')
                )->pluck('order_id')->filter();
                $pendaftaranOrderIds = \App\Models\Pendaftaran::where(function ($query) use ($userId) {
                    $query->where(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\Bootcamp::class)
                          ->whereIn('registrable_id', \App\Models\Bootcamp::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\Webinar::class)
                          ->whereIn('registrable_id', \App\Models\Webinar::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\Event::class)
                          ->whereIn('registrable_id', \App\Models\Event::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\Ebook::class)
                          ->whereIn('registrable_id', \App\Models\Ebook::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\Produkdigital::class)
                          ->whereIn('registrable_id', \App\Models\Produkdigital::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\CoachingMentoring::class)
                          ->whereIn('registrable_id', \App\Models\CoachingMentoring::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\Tulisan::class)
                          ->whereIn('registrable_id', \App\Models\Tulisan::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\Bundling::class)
                          ->whereIn('registrable_id', \App\Models\Bundling::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\PaymentLink::class)
                          ->whereIn('registrable_id', \App\Models\PaymentLink::where('user_id', $userId)->pluck('id'));
                    })->orWhere(function ($q) use ($userId) {
                        $q->where('registrable_type', \App\Models\PenggalanganDana::class)
                          ->whereIn('registrable_id', \App\Models\PenggalanganDana::where('user_id', $userId)->pluck('id'));
                    });
                })->pluck('order_id')->filter();
                $orderIds = $kelasOrderIds->concat($pendaftaranOrderIds)->unique()->toArray();

                $fakturCount = \App\Models\Pembayaran::where(function ($q) use ($bootcampIds, $orderIds) {
                    $q->whereIn('bootcamp_id', $bootcampIds);
                    if (!empty($orderIds)) {
                        $q->orWhereIn('order_id', $orderIds);
                    }
                })->where('status', 'pending')->count();

                $reviewsCount = \App\Models\Rating::where(function ($query) use ($userId) {
                    $query->whereIn('bootcamp_id', \App\Models\Bootcamp::where('user_id', $userId)->pluck('id'))
                          ->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\Bootcamp::class)
                                ->whereIn('rateable_id', \App\Models\Bootcamp::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\Webinar::class)
                                ->whereIn('rateable_id', \App\Models\Webinar::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\Event::class)
                                ->whereIn('rateable_id', \App\Models\Event::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\Ebook::class)
                                ->whereIn('rateable_id', \App\Models\Ebook::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\ProdukDigital::class)
                                ->whereIn('rateable_id', \App\Models\ProdukDigital::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\CoachingMentoring::class)
                                ->whereIn('rateable_id', \App\Models\CoachingMentoring::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\Tulisan::class)
                                ->whereIn('rateable_id', \App\Models\Tulisan::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\Bundling::class)
                                ->whereIn('rateable_id', \App\Models\Bundling::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\PaymentLink::class)
                                ->whereIn('rateable_id', \App\Models\PaymentLink::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\PenggalanganDana::class)
                                ->whereIn('rateable_id', \App\Models\PenggalanganDana::where('user_id', $userId)->pluck('id'));
                          })->orWhere(function ($q) use ($userId) {
                              $q->where('rateable_type', \App\Models\KelasOnline::class)
                                ->whereIn('rateable_id', \App\Models\KelasOnline::where('user_id', $userId)->pluck('id'));
                          });
                })->count();

                return [
                    'faktur' => (int) $fakturCount,
                    'kelasOnline' => (int) \App\Models\KelasOnline::where('user_id', $userId)->count(),
                    'webinar' => (int) \App\Models\Webinar::where('user_id', $userId)->count(),
                    'bootcamps' => (int) \App\Models\Bootcamp::where('user_id', $userId)->count(),
                    'produkDigital' => (int) \App\Models\ProdukDigital::where('user_id', $userId)->count(),
                    'penggalanganDana' => (int) \App\Models\PenggalanganDana::where('user_id', $userId)->count(),
                    'kegiatan' => (int) \App\Models\Event::where('user_id', $userId)->count(),
                    'linkPembayaran' => (int) \App\Models\PaymentLink::where('user_id', $userId)->count(),
                    'fakturPembayaran' => (int) $fakturCount,
                    'bundling' => (int) \App\Models\Bundling::where('user_id', $userId)->count(),
                    'diskonKupon' => (int) \App\Models\Diskon::where('user_id', $userId)->count(),
                    'penilaianUlasan' => (int) $reviewsCount,
                ];
            },
            'csrf_token' => csrf_token(),
            'midtrans_client_key' => config('midtrans.client_key'),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'message' => $request->session()->get('message'),
            ],
        ]);
    }
}