<?php

namespace App\Http\Controllers\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Pendaftaran;
use App\Models\Rating;
use App\Models\ProgressMateri;
use App\Models\QuizAttempt;
use App\Models\Soal;
use App\Models\Submission;
use App\Http\Controllers\Peserta\PesertaProgressController;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PesertaDashboardController extends Controller
{
    public function index()
    {
        $peserta = Auth::guard('peserta')->user();

        // 1. Fetch Bootcamps
        $pendaftaranBootcamp = Pendaftaran::with(['registrable'])
            ->where('peserta_id', $peserta->id)
            ->where('registrable_type', \App\Models\Bootcamp::class)
            ->whereIn('status', ['active', 'aktif', 'completed'])
            ->orderBy('created_at', 'desc')
            ->get();

        $myRatings = Rating::where('peserta_id', $peserta->id)
            ->get()
            ->keyBy(fn($r) => $r->rateable_type . ':' . $r->rateable_id);

        $bootcamps = $pendaftaranBootcamp->map(function($p) use ($myRatings) {
            $r = $myRatings->get(\App\Models\Bootcamp::class . ':' . $p->registrable->id)
                ?? $myRatings->values()->where('bootcamp_id', $p->registrable->id)->first();

            return [
                'id'             => $p->registrable->id,
                'name'           => $p->registrable->name,
                'cover_url'      => $p->registrable->cover_url,
                'kategori'       => 'Bootcamp',
                'type'           => 'bootcamp',
                'status'         => $p->status,
                'tanggal_aktif'  => $p->tanggal_aktif?->format('d M Y') ?? $p->created_at->format('d M Y'),
                'rating'         => $r?->bintang,
                'my_rating'      => $r ? [
                    'id'            => $r->id,
                    'bintang'       => $r->bintang,
                    'ulasan'        => $r->ulasan,
                    'tampil_anonim' => $r->tampil_anonim,
                    'foto_url'      => $r->foto_url,
                ] : null,
                'download_url'   => "/peserta/kelas/" . $p->registrable->id,
                'batch'          => $p->registrable->batch ?? 'Batch 1',
                'order_id'       => $p->order_id,
                'harga_bayar'    => (float) $p->harga_bayar,
            ];
        });

        // 2. Fetch Kelas Online
        $kelasOnlinePeserta = \App\Models\KelasOnlinePeserta::with(['kelasOnline.owner'])
            ->where('peserta_id', $peserta->id)
            ->whereIn('status', ['aktif', 'active', 'completed'])
            ->orderBy('mendaftar_pada', 'desc')
            ->get();

        $kelasOnlines = $kelasOnlinePeserta->map(function($p) use ($myRatings) {
            $r = $myRatings->get(\App\Models\KelasOnline::class . ':' . $p->kelasOnline->id);

            return [
                'id'            => $p->kelasOnline->id,
                'name'          => $p->kelasOnline->nama,
                'cover_url'     => $p->kelasOnline->thumbnail ? asset('storage/' . $p->kelasOnline->thumbnail) : null,
                'kategori'      => 'Kelas Online',
                'type'          => 'kelas-online',
                'status'        => $p->status,
                'tanggal_aktif' => $p->mendaftar_pada?->format('d M Y') ?? $p->created_at->format('d M Y'),
                'rating'        => $r?->bintang,
                'my_rating'     => $r ? [
                    'id'            => $r->id,
                    'bintang'       => $r->bintang,
                    'ulasan'        => $r->ulasan,
                    'tampil_anonim' => $r->tampil_anonim,
                    'foto_url'      => $r->foto_url,
                ] : null,
                'download_url'  => "/peserta/kelas-online/" . $p->kelasOnline->id,
                'owner_name'    => $p->kelasOnline->owner->name ?? 'Admin',
                'order_id'      => $p->order_id,
                'harga_bayar'   => $p->order_id 
                    ? (float) (\App\Models\Pembayaran::where('order_id', $p->order_id)->value('jumlah') ?? $p->kelasOnline->harga)
                    : (($p->kelasOnline->is_gratis || $p->kelasOnline->harga <= 0) ? 0.0 : (float) $p->kelasOnline->harga),
            ];
        });

        // 3. Fetch Other Polymorphic Products
        $otherPendaftaran = Pendaftaran::with(['registrable'])
            ->where('peserta_id', $peserta->id)
            ->whereIn('status', ['active', 'aktif', 'completed'])
            ->where('registrable_type', '!=', \App\Models\Bootcamp::class)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) use ($myRatings) {
                if (!$p->registrable) return null;

                $downloadUrl = null;
                $productType = 'other';
                $kategori = 'Produk';
                $coverUrl = null;

                $type = class_basename($p->registrable_type);
                if ($type === 'Ebook') {
                    $downloadUrl = $p->registrable->file_url;
                    if ($downloadUrl && !str_starts_with($downloadUrl, 'http')) {
                        $downloadUrl = asset('storage/' . $downloadUrl);
                    }
                    $productType = 'ebook';
                    $kategori = 'E-Book';
                    $coverUrl = $p->registrable->cover ? asset('storage/' . $p->registrable->cover) : null;
                } elseif ($type === 'Webinar') {
                    $downloadUrl = $p->registrable->link_webinar;
                    $productType = 'webinar';
                    $kategori = 'Webinar';
                } elseif ($type === 'Event') {
                    $downloadUrl = $p->registrable->redirect_url;
                    $productType = 'event';
                    $kategori = 'Event';
                } elseif ($type === 'Produkdigital' || $type === 'ProdukDigital') {
                    $downloadUrl = $p->registrable->file_url;
                    if ($downloadUrl && !str_starts_with($downloadUrl, 'http')) {
                        $downloadUrl = asset('storage/' . $downloadUrl);
                    }
                    $productType = 'produk-digital';
                    $kategori = 'Produk Digital';
                    $coverUrl = $p->registrable->cover_url ? asset('storage/' . $p->registrable->cover_url) : null;
                } elseif ($type === 'CoachingMentoring') {
                    $downloadUrl = $p->registrable->booking_url;
                    $productType = 'coaching-mentoring';
                    $kategori = 'Coaching / Mentoring';
                } elseif ($type === 'Tulisan') {
                    $downloadUrl = '/tulisan/' . $p->registrable->id . '/p';
                    $productType = 'tulisan';
                    $kategori = 'Tulisan / Artikel';
                    $coverUrl = $p->registrable->cover ? asset('storage/' . $p->registrable->cover) : null;
                } elseif ($type === 'Bundling') {
                    $productType = 'bundling';
                    $kategori = 'Bundling';
                }

                if (in_array($productType, ['ebook', 'tulisan', 'webinar', 'event', 'coaching-mentoring', 'produk-digital', 'bundling'])) {
                    $downloadUrl = "/peserta/produk/" . $productType . "/" . $p->registrable->id;
                }

                $r = $myRatings->get($p->registrable_type . ':' . $p->registrable->id);

                return [
                    'id'            => $p->registrable->id,
                    'name'          => $p->registrable->nama ?? $p->registrable->name,
                    'cover_url'     => $coverUrl,
                    'status'        => $p->status,
                    'tanggal_aktif' => $p->tanggal_aktif?->format('d M Y') ?? $p->created_at->format('d M Y'),
                    'type'          => $productType,
                    'kategori'      => $kategori,
                    'download_url'  => $downloadUrl,
                    'rating'        => $r?->bintang,
                    'my_rating'     => $r ? [
                        'id'            => $r->id,
                        'bintang'       => $r->bintang,
                        'ulasan'        => $r->ulasan,
                        'tampil_anonim' => $r->tampil_anonim,
                        'foto_url'      => $r->foto_url,
                    ] : null,
                    'order_id'      => $p->order_id,
                    'harga_bayar'   => (float) $p->harga_bayar,
                ];
            })
            ->filter()
            ->values();

        // 4. Merge all together
        $purchasedProducts = collect([])
            ->concat($bootcamps)
            ->concat($kelasOnlines)
            ->concat($otherPendaftaran)
            ->sortByDesc(function($item) {
                return strtotime($item['tanggal_aktif']);
            })
            ->values()
            ->toArray();

        return Inertia::render('Peserta/dashboard', [
            'peserta'   => [
                'id'       => $peserta->id,
                'nama'     => $peserta->nama,
                'email'    => $peserta->email,
                'no_hp'    => $peserta->no_hp,
                'foto_url' => $peserta->foto_url,
            ],
            'purchasedProducts' => $purchasedProducts,
        ]);
    }

    public function kelas($bootcampId)
    {
        $peserta = Auth::guard('peserta')->user();

        // Cek akses
        $pendaftaran = Pendaftaran::where('registrable_id', $bootcampId)
            ->where('registrable_type', \App\Models\Bootcamp::class)
            ->where('peserta_id', $peserta->id)
            ->whereNotIn('status', ['ditolak', 'rejected'])
            ->with([
                'registrable.babs.materis',
                'registrable.assignments.soals',
            ])
            ->firstOrFail();

        $bootcamp = $pendaftaran->registrable;

        // Load progress materi milik peserta ini
        $myProgress = ProgressMateri::where('peserta_id', $peserta->id)
            ->where('bootcamp_id', $bootcamp->id)
            ->pluck('materi_id')
            ->toArray();

        // Load nilai tertinggi quiz per assignment
        $myQuizBest = QuizAttempt::where('peserta_id', $peserta->id)
            ->whereIn('assignment_id', $bootcamp->assignments->pluck('id'))
            ->selectRaw('assignment_id, MAX(nilai) as nilai_tertinggi, COUNT(*) as attempt_ke')
            ->groupBy('assignment_id')
            ->get()
            ->keyBy('assignment_id');

        // Load submissions milik peserta ini
        $mySubmissions = Submission::where('peserta_id', $peserta->id)
            ->whereIn('assignment_id', $bootcamp->assignments->pluck('id'))
            ->get()
            ->keyBy('assignment_id');

        $myRating = Rating::where('peserta_id', $peserta->id)
            ->where(function($q) use ($bootcampId) {
                $q->where('rateable_type', \App\Models\Bootcamp::class)
                  ->where('rateable_id', $bootcampId);
            })
            ->orWhere(function($q) use ($bootcampId, $peserta) {
                $q->where('bootcamp_id', $bootcampId)
                  ->where('peserta_id', $peserta->id);
            })
            ->first();

        return Inertia::render('Peserta/kelas', [
            'peserta'  => [
                'id'   => $peserta->id,
                'nama' => $peserta->nama,
            ],
            'bootcamp' => [
                'id'    => $bootcamp->id,
                'name'  => $bootcamp->name,
                'batch' => $bootcamp->batch,
            ],
            'myRating' => $myRating ? [
                'id'            => $myRating->id,
                'bintang'       => $myRating->bintang,
                'ulasan'        => $myRating->ulasan,
                'tampil_anonim' => $myRating->tampil_anonim,
                'foto_url'      => $myRating->foto_url,
            ] : null,
            'babList' => $bootcamp->babs->map(fn($b) => [
                'id'      => $b->id,
                'judul'   => $b->judul,
                'urutan'  => $b->urutan,
                'materis' => $b->materis->map(fn($m) => [
                    'id'     => $m->id,
                    'judul'  => $m->judul,
                    'tipe'   => $m->tipe,
                    'konten' => $m->konten,
                    'durasi' => $m->durasi,
                    'urutan'        => $m->urutan,
                    'is_selesai'    => in_array($m->id, $myProgress),
                    'assignment_id' => $m->assignment_id,
                ])->values(),
            ])->values(),
            'progressPersen' => PesertaProgressController::hitungProgress($bootcamp, $peserta->id),
            'assignments' => $bootcamp->assignments->map(function ($a) use ($mySubmissions, $myQuizBest) {
                $sub  = $mySubmissions->get($a->id);
                $quiz = $myQuizBest->get($a->id);
                return [
                    'id'             => $a->id,
                    'judul'          => $a->judul,
                    'tugas'          => $a->tugas,
                    'is_wajib'       => $a->is_wajib,
                    'tanggal_mulai'  => $a->tanggal_mulai?->format('d M Y'),
                    'tanggal_akhir'  => $a->tanggal_akhir?->format('d M Y'),
                    'is_tugas_akhir' => (bool) $a->is_tugas_akhir,
                    'tipe'           => $a->tipe ?? 'upload',
                    'soals'          => $a->soals->sortBy('urutan')->map(fn($s) => [
                        'id'         => $s->id,
                        'pertanyaan' => $s->pertanyaan,
                        'tipe_soal'  => $s->tipe_soal,
                        'pilihan'    => $s->pilihan,
                        'urutan'     => $s->urutan,
                        // jawaban_benar TIDAK dikirim ke peserta!
                    ])->values()->toArray(),
                    'nilai_tertinggi' => $quiz?->nilai_tertinggi,
                    'attempt_ke'      => $quiz?->attempt_ke ?? 0,
                    'submission'      => $sub ? [
                        'id'              => $sub->id,
                        'submission_url'  => $sub->submission_url,
                        'submission_teks' => $sub->submission_teks,
                        'grade'           => $sub->grade,
                        'waktu_kirim'     => $sub->waktu_kirim?->toISOString(),
                    ] : null,
                ];
            })->values(),
        ]);
    }

    public function kelasOnline($id)
    {
        $peserta = Auth::guard('peserta')->user();

        // Cek apakah terdaftar
        $enrollment = \App\Models\KelasOnlinePeserta::where('kelas_online_id', $id)
            ->where('peserta_id', $peserta->id)
            ->where('status', 'aktif')
            ->firstOrFail();

        $kelas = \App\Models\KelasOnline::with([
            'sesi', 'owner', 'instruktur', 'meetings', 
            'assignments.files', 
            'assignments.soals',
            'assignments.submissions' => function($q) use ($peserta) {
                $q->where('peserta_id', $peserta->id);
            }
        ])->findOrFail($id);

        $myRating = Rating::where('peserta_id', $peserta->id)
            ->where('rateable_type', \App\Models\KelasOnline::class)
            ->where('rateable_id', $id)
            ->first();

        return Inertia::render('Peserta/KelasOnline/Belajar', [
            'kelas'   => $kelas,
            'peserta' => [
                'id'       => $peserta->id,
                'nama'     => $peserta->nama,
                'email'    => $peserta->email,
                'foto_url' => $peserta->foto_url,
            ],
            'materi'  => [
                'file' => $kelas->materi_file ? asset('storage/' . $kelas->materi_file) : null,
                'name' => $kelas->materi_nama_asli,
            ],
            'myRating' => $myRating ? [
                'id'            => $myRating->id,
                'bintang'       => $myRating->bintang,
                'ulasan'        => $myRating->ulasan,
                'tampil_anonim' => $myRating->tampil_anonim,
                'foto_url'      => $myRating->foto_url,
            ] : null,
        ]);
    }

    public function updateProfile(\Illuminate\Http\Request $request)
    {
        $peserta = Auth::guard('peserta')->user();

        $request->validate([
            'nama'     => 'required|string|max:255',
            'no_hp'    => 'nullable|string|max:20',
            'email'    => 'required|email|unique:peserta,email,' . $peserta->id,
            'password' => 'nullable|string|min:8',
            'foto'     => 'nullable|image|max:2048',
        ]);

        $data = [
            'nama'  => $request->nama,
            'email' => $request->email,
            'no_hp' => $request->no_hp,
        ];

        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        if ($request->hasFile('foto')) {
            // Delete old photo if exists
            if ($peserta->foto) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($peserta->foto);
            }
            $path = $request->file('foto')->store('peserta', 'public');
            $data['foto'] = $path;
        }

        $peserta->update($data);

        return back();
    }

    public function viewProduct($type, $id)
    {
        $peserta = Auth::guard('peserta')->user();

        $typeMapping = [
            'ebook' => \App\Models\Ebook::class,
            'tulisan' => \App\Models\Tulisan::class,
            'webinar' => \App\Models\Webinar::class,
            'event' => \App\Models\Event::class,
            'coaching-mentoring' => \App\Models\CoachingMentoring::class,
            'produk-digital' => \App\Models\Produkdigital::class,
            'bundling' => \App\Models\Bundling::class,
        ];

        if (!array_key_exists($type, $typeMapping)) {
            abort(404, 'Tipe produk tidak didukung');
        }

        $class = $typeMapping[$type];

        // Cek pendaftaran aktif
        if ($type === 'bundling') {
            $pendaftaran = Pendaftaran::where('peserta_id', $peserta->id)
                ->where('registrable_type', $class)
                ->where('registrable_id', $id)
                ->whereIn('status', ['active', 'aktif', 'completed'])
                ->first();

            if (!$pendaftaran) {
                $pendaftaran = \App\Models\BundlingRegistration::where('peserta_id', $peserta->id)
                    ->where('bundling_id', $id)
                    ->whereIn('status_pembayaran', ['success', 'paid', 'completed', 'active'])
                    ->first();
            }

            if (!$pendaftaran) {
                abort(404, 'Pendaftaran bundling tidak ditemukan');
            }

            $product = $pendaftaran->registrable ?? ($pendaftaran->bundling ?? null);
        } else {
            $pendaftaran = Pendaftaran::where('peserta_id', $peserta->id)
                ->where('registrable_type', $class)
                ->where('registrable_id', $id)
                ->whereIn('status', ['active', 'aktif', 'completed'])
                ->first();

            if ($pendaftaran) {
                $product = $pendaftaran->registrable;
            } else {
                // Cek apakah ada akses melalui pembelian bundling
                $bundlingIdsDirect = Pendaftaran::where('peserta_id', $peserta->id)
                    ->where('registrable_type', \App\Models\Bundling::class)
                    ->whereIn('status', ['active', 'aktif', 'completed'])
                    ->pluck('registrable_id');

                $bundlingIdsReg = \App\Models\BundlingRegistration::where('peserta_id', $peserta->id)
                    ->whereIn('status_pembayaran', ['success', 'paid', 'completed', 'active'])
                    ->pluck('bundling_id');

                $allBundlingIds = $bundlingIdsDirect->concat($bundlingIdsReg)->unique();

                $isPartOfPurchasedBundle = \App\Models\BundlingItem::whereIn('bundling_id', $allBundlingIds)
                    ->where('itemable_type', $class)
                    ->where('itemable_id', $id)
                    ->exists();

                if ($isPartOfPurchasedBundle) {
                    $product = $class::find($id);
                    $pendaftaran = new Pendaftaran([
                        'peserta_id' => $peserta->id,
                        'registrable_type' => $class,
                        'registrable_id' => $id,
                        'status' => 'active',
                        'tanggal_aktif' => now(),
                        'created_at' => now(),
                    ]);
                    $pendaftaran->id = 0; // dummy id
                } else {
                    abort(404, 'Anda belum membeli produk ini atau akses Anda telah berakhir.');
                }
            }
        }

        if (!$product) {
            abort(404, 'Data produk tidak ditemukan');
        }

        // Map data agar standard di frontend
        $mappedProduct = [
            'id' => $product->id,
            'nama' => $product->nama ?? $product->name,
            'cover' => $type === 'ebook'
                ? ($product->cover ? asset('storage/' . $product->cover) : null)
                : ($type === 'tulisan'
                    ? ($product->cover ? asset('storage/' . $product->cover) : null)
                    : ($type === 'webinar'
                        ? ($product->cover ? asset('storage/' . $product->cover) : null)
                        : ($type === 'event'
                            ? ($product->cover ? asset('storage/' . $product->cover) : null)
                            : ($type === 'produk-digital'
                                ? ($product->cover_url ? asset('storage/' . $product->cover_url) : null)
                                : ($type === 'bundling'
                                    ? ($product->cover ? asset('storage/' . $product->cover) : null)
                                    : null))))),
            'deskripsi' => $product->deskripsi,
            'created_at' => $product->created_at->format('d M Y'),
        ];

        // Tambahkan detail spesifik berdasarkan tipe
        if ($type === 'ebook') {
            $mappedProduct['file_url'] = $product->file_url ? (str_starts_with($product->file_url, 'http') ? $product->file_url : asset('storage/' . $product->file_url)) : null;
            $mappedProduct['author'] = $product->author ?? 'Anonim';
            $mappedProduct['isbn'] = $product->isbn;
            $mappedProduct['format'] = $product->format ?? 'PDF';
            $mappedProduct['bahasa'] = $product->bahasa ?? 'Indonesia';
            $mappedProduct['jumlah_halaman'] = $product->jumlah_halaman;
            $mappedProduct['bisa_didownload'] = $product->bisa_didownload ?? true;
        } elseif ($type === 'tulisan') {
            $mappedProduct['tipe_tulisan'] = $product->tipe_tulisan ?? 'one_shot';
            $mappedProduct['genre'] = $product->genre ?? 'General';
            $mappedProduct['author'] = $product->author ?? 'Anonim';
            $mappedProduct['bahasa'] = $product->bahasa ?? 'Indonesia';
            $wordCount = str_word_count(strip_tags($product->deskripsi ?? ''));
            $mappedProduct['reading_time'] = max(1, ceil($wordCount / 200)); // 200 wpm
        } elseif ($type === 'webinar') {
            $mappedProduct['link_zoom'] = $product->redirect_url ?? $product->url ?? null;
            $mappedProduct['tanggal_mulai'] = $product->tanggal_mulai ? $product->tanggal_mulai->format('d M Y H:i') : null;
            $mappedProduct['tanggal_selesai'] = $product->tanggal_selesai ? $product->tanggal_selesai->format('d M Y H:i') : null;
            $mappedProduct['instruksi'] = $product->instruksi;
            $mappedProduct['syarat_ketentuan'] = $product->syarat_ketentuan;
            $mappedProduct['timezone'] = $product->timezone ?? 'Asia/Jakarta';
            $product->load('pembicaras');
            $mappedProduct['pembicaras'] = $product->pembicaras->map(fn($pem) => [
                'nama' => $pem->nama,
                'pekerjaan' => $pem->pekerjaan,
                'profil' => $pem->profil,
                'foto' => $pem->foto ? asset('storage/' . $pem->foto) : null,
            ])->toArray();
        } elseif ($type === 'event') {
            $mappedProduct['redirect_url'] = $product->redirect_url;
            $mappedProduct['lokasi'] = $product->lokasi ?? 'Online';
            $mappedProduct['tanggal_event'] = $product->waktu_mulai ? $product->waktu_mulai->format('d M Y H:i') : null;
            $mappedProduct['instruksi'] = $product->instruksi ?? $product->catatan ?? null;
        } elseif ($type === 'coaching-mentoring') {
            $mappedProduct['booking_url'] = $product->booking_url;
            $mappedProduct['jumlah_sesi'] = $product->jumlah_sesi ?? 1;
            $mappedProduct['durasi_menit'] = $product->durasi_menit ?? 60;
        } elseif ($type === 'produk-digital') {
            $mappedProduct['file_url'] = $product->file_url ? (str_starts_with($product->file_url, 'http') ? $product->file_url : asset('storage/' . $product->file_url)) : null;
            $mappedProduct['instruksi'] = $product->instruksi ?? $product->catatan ?? null;
        } elseif ($type === 'bundling') {
            $mappedProduct['pesan_setelah_bayar'] = $product->pesan_setelah_bayar;
            $product->load('items.itemable');
            $items = [];
            foreach ($product->items as $item) {
                if ($item->itemable) {
                    $itemType = strtolower(class_basename($item->itemable_type));
                    if ($itemType === 'produkdigital') {
                        $itemType = 'produk-digital';
                    } elseif ($itemType === 'coachingmentoring') {
                        $itemType = 'coaching-mentoring';
                    }
                    $items[] = [
                        'id' => $item->itemable->id,
                        'name' => $item->itemable->nama ?? $item->itemable->name,
                        'type' => $itemType,
                        'url' => "/peserta/produk/" . $itemType . "/" . $item->itemable->id,
                    ];
                }
            }
            $mappedProduct['bundle_items'] = $items;
        }

        $myRating = Rating::where('peserta_id', $peserta->id)
            ->where('rateable_type', $class)
            ->where('rateable_id', $id)
            ->first();

        return Inertia::render('Peserta/ProductViewer', [
            'peserta' => [
                'id'       => $peserta->id,
                'nama'     => $peserta->nama,
                'email'    => $peserta->email,
                'no_hp'    => $peserta->no_hp,
                'foto_url' => $peserta->foto_url,
            ],
            'product' => $mappedProduct,
            'productType' => $type,
            'registration' => [
                'id' => $pendaftaran->id,
                'tanggal_aktif' => $pendaftaran->tanggal_aktif?->format('d M Y') ?? $pendaftaran->created_at->format('d M Y'),
                'status' => $pendaftaran->status,
                'order_id' => $pendaftaran->order_id ?? null,
            ],
            'myRating' => $myRating ? [
                'id'            => $myRating->id,
                'bintang'       => $myRating->bintang,
                'ulasan'        => $myRating->ulasan,
                'tampil_anonim' => $myRating->tampil_anonim,
                'foto_url'      => $myRating->foto_url,
            ] : null,
        ]);
    }
}