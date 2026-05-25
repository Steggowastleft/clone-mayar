<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\ProdukDigital;
use App\Models\Bootcamp;
use App\Models\KelasOnline;
use App\Models\Webinar;
use App\Models\Bundling;
use App\Models\CoachingMentoring;
use App\Models\Ebook;
use App\Models\Event;
use App\Models\PaymentLink;
use App\Models\PenggalanganDana;
use App\Models\Tulisan;
use Illuminate\Support\Facades\Storage;

class AdminManagementController extends Controller
{
    public function usersIndex(Request $request)
    {
        $users = User::with(['accountVerification'])
            ->get()
            ->map(function ($u) {
                // Fetch products created by this user
                $digitalProducts = ProdukDigital::where('user_id', $u->id)->get();
                $bootcamps = Bootcamp::where('user_id', $u->id)->get();
                $kelasOnline = KelasOnline::where('user_id', $u->id)->get();
                $webinars = Webinar::where('user_id', $u->id)->get();

                $products = [];
                foreach ($digitalProducts as $dp) {
                    $products[] = [
                        'id' => $dp->id,
                        'name' => $dp->nama,
                        'type' => 'Digital Product',
                        'price' => (int) $dp->harga,
                        'status' => $dp->status ?? 'draft',
                        'description' => $dp->deskripsi ?? 'Tidak ada deskripsi.',
                        'created_at' => $dp->created_at ? $dp->created_at->format('Y-m-d H:i') : '—',
                        'cover_url' => $dp->cover_url
                    ];
                }
                foreach ($bootcamps as $bc) {
                    $products[] = [
                        'id' => $bc->id,
                        'name' => $bc->name,
                        'type' => 'Bootcamp',
                        'price' => (int) $bc->harga,
                        'status' => $bc->status ?? 'draft',
                        'description' => $bc->deskripsi ?? 'Tidak ada deskripsi.',
                        'created_at' => $bc->created_at ? $bc->created_at->format('Y-m-d H:i') : '—',
                        'cover_url' => $bc->cover_url
                    ];
                }
                foreach ($kelasOnline as $ko) {
                    $products[] = [
                        'id' => $ko->id,
                        'name' => $ko->nama,
                        'type' => 'Online Class',
                        'price' => (int) $ko->harga,
                        'status' => $ko->status ?? 'draft',
                        'description' => $ko->deskripsi ?? 'Tidak ada deskripsi.',
                        'created_at' => $ko->created_at ? $ko->created_at->format('Y-m-d H:i') : '—',
                        'cover_url' => $ko->thumbnail ? asset('storage/' . $ko->thumbnail) : null
                    ];
                }
                foreach ($webinars as $wb) {
                    $products[] = [
                        'id' => $wb->id,
                        'name' => $wb->nama,
                        'type' => 'Webinar',
                        'price' => (int) $wb->harga,
                        'status' => $wb->status ?? 'draft',
                        'description' => $wb->deskripsi ?? 'Tidak ada deskripsi.',
                        'created_at' => $wb->created_at ? $wb->created_at->format('Y-m-d H:i') : '—',
                        'cover_url' => $wb->cover ? asset('storage/' . $wb->cover) : null
                    ];
                }

                // Check role
                $role = 'creator';
                if ($u->hasRole('admin')) {
                    $role = 'admin';
                }

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'role' => $role,
                    'created_at' => $u->created_at ? $u->created_at->format('Y-m-d H:i') : '—',
                    'verification_status' => ($u->accountVerification?->status === 'approved') ? 'verified' : ($u->accountVerification?->status ?? 'unverified'),
                    'products_count' => count($products),
                    'products' => $products
                ];
            });

        return Inertia::render('adminpanel/Users', [
            'users' => $users,
        ]);
    }

    public function productsIndex(Request $request)
    {
        $digitalProducts = ProdukDigital::with('user')->get();
        $bootcamps = Bootcamp::with('user')->get();
        $kelasOnline = KelasOnline::with('owner')->get();
        $webinars = Webinar::with('user')->get();
        $bundlings = Bundling::with('user')->get();
        $coachings = CoachingMentoring::with('user')->get();
        $ebooks = Ebook::with('user')->get();
        $events = Event::with(['user', 'tiket'])->get();
        $paymentLinks = PaymentLink::with('user')->get();
        $donations = PenggalanganDana::with('user')->get();
        $tulisans = Tulisan::with('user')->get();

        $allProducts = [];

        foreach ($digitalProducts as $dp) {
            $allProducts[] = [
                'id' => $dp->id,
                'name' => $dp->nama,
                'type' => 'Digital Product',
                'price' => (int) $dp->harga,
                'status' => $dp->status ?? 'draft',
                'description' => $dp->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $dp->created_at ? $dp->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $dp->cover_url,
                'creator' => [
                    'name' => $dp->user?->name ?? 'Unknown',
                    'email' => $dp->user?->email ?? '—'
                ]
            ];
        }

        foreach ($bootcamps as $bc) {
            $allProducts[] = [
                'id' => $bc->id,
                'name' => $bc->name,
                'type' => 'Bootcamp',
                'price' => (int) $bc->harga,
                'status' => $bc->status ?? 'draft',
                'description' => $bc->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $bc->created_at ? $bc->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $bc->cover_url,
                'creator' => [
                    'name' => $bc->user?->name ?? 'Unknown',
                    'email' => $bc->user?->email ?? '—'
                ]
            ];
        }

        foreach ($kelasOnline as $ko) {
            $allProducts[] = [
                'id' => $ko->id,
                'name' => $ko->nama,
                'type' => 'Online Class',
                'price' => (int) $ko->harga,
                'status' => $ko->status ?? 'draft',
                'description' => $ko->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $ko->created_at ? $ko->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $ko->thumbnail ? asset('storage/' . $ko->thumbnail) : null,
                'creator' => [
                    'name' => $ko->owner?->name ?? 'Unknown',
                    'email' => $ko->owner?->email ?? '—'
                ]
            ];
        }

        foreach ($webinars as $wb) {
            $allProducts[] = [
                'id' => $wb->id,
                'name' => $wb->nama,
                'type' => 'Webinar',
                'price' => (int) $wb->harga,
                'status' => $wb->status ?? 'draft',
                'description' => $wb->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $wb->created_at ? $wb->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $wb->cover ? asset('storage/' . $wb->cover) : null,
                'creator' => [
                    'name' => $wb->user?->name ?? 'Unknown',
                    'email' => $wb->user?->email ?? '—'
                ]
            ];
        }

        foreach ($bundlings as $b) {
            $allProducts[] = [
                'id' => $b->id,
                'name' => $b->nama,
                'type' => 'Bundling',
                'price' => (int) $b->harga,
                'status' => $b->status ?? 'draft',
                'description' => $b->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $b->created_at ? $b->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $b->cover ? asset('storage/' . $b->cover) : null,
                'creator' => [
                    'name' => $b->user?->name ?? 'Unknown',
                    'email' => $b->user?->email ?? '—'
                ]
            ];
        }

        foreach ($coachings as $c) {
            $allProducts[] = [
                'id' => $c->id,
                'name' => $c->nama,
                'type' => 'Coaching & Mentoring',
                'price' => (int) $c->harga,
                'status' => $c->status ?? 'draft',
                'description' => $c->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $c->created_at ? $c->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $c->cover ? asset('storage/' . $c->cover) : null,
                'creator' => [
                    'name' => $c->user?->name ?? 'Unknown',
                    'email' => $c->user?->email ?? '—'
                ]
            ];
        }

        foreach ($ebooks as $e) {
            $allProducts[] = [
                'id' => $e->id,
                'name' => $e->nama,
                'type' => 'Ebook',
                'price' => (int) $e->harga,
                'status' => $e->status ?? 'draft',
                'description' => $e->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $e->created_at ? $e->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $e->cover ? asset('storage/' . $e->cover) : null,
                'creator' => [
                    'name' => $e->user?->name ?? 'Unknown',
                    'email' => $e->user?->email ?? '—'
                ]
            ];
        }

        foreach ($events as $evt) {
            $allProducts[] = [
                'id' => $evt->id,
                'name' => $evt->nama,
                'type' => 'Event',
                'price' => (int) ($evt->tiket->min('harga') ?? 0),
                'status' => $evt->status ?? 'draft',
                'description' => $evt->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $evt->created_at ? $evt->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $evt->cover_url,
                'creator' => [
                    'name' => $evt->user?->name ?? 'Unknown',
                    'email' => $evt->user?->email ?? '—'
                ]
            ];
        }

        foreach ($paymentLinks as $pl) {
            $allProducts[] = [
                'id' => $pl->id,
                'name' => $pl->nama,
                'type' => 'Payment Link',
                'price' => (int) $pl->harga,
                'status' => $pl->status ?? 'draft',
                'description' => $pl->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $pl->created_at ? $pl->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $pl->cover_url ?: ($pl->cover ? asset('storage/' . $pl->cover) : null),
                'creator' => [
                    'name' => $pl->user?->name ?? 'Unknown',
                    'email' => $pl->user?->email ?? '—'
                ]
            ];
        }

        foreach ($donations as $pd) {
            $allProducts[] = [
                'id' => $pd->id,
                'name' => $pd->nama,
                'type' => 'Penggalangan Dana',
                'price' => (int) $pd->harga,
                'status' => $pd->status ?? 'draft',
                'description' => $pd->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $pd->created_at ? $pd->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $pd->cover_url,
                'creator' => [
                    'name' => $pd->user?->name ?? 'Unknown',
                    'email' => $pd->user?->email ?? '—'
                ]
            ];
        }

        foreach ($tulisans as $t) {
            $allProducts[] = [
                'id' => $t->id,
                'name' => $t->nama,
                'type' => 'Tulisan',
                'price' => (int) $t->harga,
                'status' => $t->status ?? 'draft',
                'description' => $t->deskripsi ?? 'Tidak ada deskripsi.',
                'created_at' => $t->created_at ? $t->created_at->format('Y-m-d H:i') : '—',
                'cover_url' => $t->cover ? asset('storage/' . $t->cover) : null,
                'creator' => [
                    'name' => $t->user?->name ?? 'Unknown',
                    'email' => $t->user?->email ?? '—'
                ]
            ];
        }

        usort($allProducts, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        return Inertia::render('adminpanel/Products', [
            'products' => $allProducts,
        ]);
    }

    public function deleteProduct($type, $id)
    {
        switch ($type) {
            case 'Digital Product':
            case 'digital-product':
                $product = ProdukDigital::findOrFail($id);
                break;
            case 'Bootcamp':
            case 'bootcamp':
                $product = Bootcamp::findOrFail($id);
                break;
            case 'Online Class':
            case 'online-class':
                $product = KelasOnline::findOrFail($id);
                break;
            case 'Webinar':
            case 'webinar':
                $product = Webinar::findOrFail($id);
                break;
            case 'Bundling':
            case 'bundling':
                $product = Bundling::findOrFail($id);
                break;
            case 'Coaching & Mentoring':
            case 'coaching-mentoring':
            case 'coaching-&-mentoring':
                $product = CoachingMentoring::findOrFail($id);
                break;
            case 'Ebook':
            case 'ebook':
                $product = Ebook::findOrFail($id);
                break;
            case 'Event':
            case 'event':
                $product = Event::findOrFail($id);
                break;
            case 'Payment Link':
            case 'payment-link':
                $product = PaymentLink::findOrFail($id);
                break;
            case 'Penggalangan Dana':
            case 'penggalangan-dana':
                $product = PenggalanganDana::findOrFail($id);
                break;
            case 'Tulisan':
            case 'tulisan':
                $product = Tulisan::findOrFail($id);
                break;
            default:
                return back()->withErrors(['message' => 'Tipe produk tidak dikenali.']);
        }

        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus oleh admin.');
    }

    public function productDetail($type, $id)
    {
        $product = null;
        $creator = null;
        $normalizedType = '';

        switch ($type) {
            case 'Digital Product':
            case 'digital-product':
                $p = ProdukDigital::with('user')->findOrFail($id);
                $normalizedType = 'Digital Product';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover_url;
                break;
            case 'Bootcamp':
            case 'bootcamp':
                $p = Bootcamp::with('user')->findOrFail($id);
                $normalizedType = 'Bootcamp';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover_url;
                break;
            case 'Online Class':
            case 'online-class':
                $p = KelasOnline::with('owner')->findOrFail($id);
                $normalizedType = 'Online Class';
                $creator = $p->owner;
                $product = $p->toArray();
                $product['cover_url'] = $p->thumbnail ? asset('storage/' . $p->thumbnail) : null;
                break;
            case 'Webinar':
            case 'webinar':
                $p = Webinar::with('user')->findOrFail($id);
                $normalizedType = 'Webinar';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover_url;
                break;
            case 'Bundling':
            case 'bundling':
                $p = Bundling::with('user')->findOrFail($id);
                $normalizedType = 'Bundling';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover ? asset('storage/' . $p->cover) : null;
                break;
            case 'Coaching & Mentoring':
            case 'coaching-mentoring':
            case 'coaching-&-mentoring':
                $p = CoachingMentoring::with('user')->findOrFail($id);
                $normalizedType = 'Coaching & Mentoring';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover ? asset('storage/' . $p->cover) : null;
                break;
            case 'Ebook':
            case 'ebook':
                $p = Ebook::with('user')->findOrFail($id);
                $normalizedType = 'Ebook';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover ? asset('storage/' . $p->cover) : null;
                break;
            case 'Event':
            case 'event':
                $p = Event::with(['user', 'tiket'])->findOrFail($id);
                $normalizedType = 'Event';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover_url;
                $product['tiket'] = $p->tiket->toArray();
                break;
            case 'Payment Link':
            case 'payment-link':
                $p = PaymentLink::with('user')->findOrFail($id);
                $normalizedType = 'Payment Link';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover_url ?: ($p->cover ? asset('storage/' . $p->cover) : null);
                break;
            case 'Penggalangan Dana':
            case 'penggalangan-dana':
                $p = PenggalanganDana::with('user')->findOrFail($id);
                $normalizedType = 'Penggalangan Dana';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover_url;
                break;
            case 'Tulisan':
            case 'tulisan':
                $p = Tulisan::with('user')->findOrFail($id);
                $normalizedType = 'Tulisan';
                $creator = $p->user;
                $product = $p->toArray();
                $product['cover_url'] = $p->cover ? asset('storage/' . $p->cover) : null;
                break;
            default:
                abort(404, 'Tipe produk tidak dikenali.');
        }

        // Add verification status to creator info
        $creatorInfo = null;
        if ($creator) {
            $verification = \App\Models\AccountVerification::where('user_id', $creator->id)
                ->orderByDesc('created_at')
                ->first();

            $creatorInfo = [
                'id' => $creator->id,
                'name' => $creator->name,
                'email' => $creator->email,
                'phone' => $creator->phone ?? '—',
                'business_name' => $creator->business_name ?? '—',
                'verification_status' => ($verification?->status === 'approved') ? 'verified' : ($verification?->status ?? 'unverified'),
                'created_at' => $creator->created_at ? $creator->created_at->format('Y-m-d H:i') : '—',
            ];
        }

        return Inertia::render('adminpanel/ProductDetail', [
            'product' => $product,
            'creator' => $creatorInfo,
            'type' => $normalizedType,
        ]);
    }
}
