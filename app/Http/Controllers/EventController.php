<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTiket;
use App\Models\EventPembicara;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    // ─────────────────────────────────────
    // INDEX
    // ─────────────────────────────────────
    public function index(): Response
    {
        $events = Event::where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(fn($e) => [
                'id'       => $e->id,
                'name'     => $e->nama,
                'status'   => $e->status,
                'date'     => $e->waktu_mulai
                    ? $e->waktu_mulai->format('d M Y H:i')
                    : '-',
                'location' => $e->lokasi,
                'participants' => $e->pendaftaran()->count(),
                'tipe'     => $e->tipe,
                'cover_url' => $e->cover_url,
                'created_at' => $e->created_at->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('event/index', [
            'events' => $events
        ]);
    }

    // ─────────────────────────────────────
    // STORE
    // ─────────────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama'                    => 'required|string|max:100',
            'deskripsi'               => 'required|string',
            'tipe'                    => 'required|in:online,offline',
            'lokasi'                  => 'nullable|string|max:300',
            'lokasi_map'              => 'nullable|string',
            'waktu_mulai'             => 'required|date',
            'waktu_selesai'           => 'nullable|date|after:waktu_mulai',
            'waktu_mulai_jual'        => 'nullable|date',
            'tanggal_tutup_daftar'    => 'nullable|date',
            'max_tiket_per_transaksi' => 'required|integer|min:1|max:50',
            'instruksi'               => 'nullable|string|max:500',
            'syarat_ketentuan'        => 'nullable|string|max:1000',
            'redirect_url'            => 'nullable|url',
            'bisa_affiliate'          => 'nullable|boolean',
            'cover'                   => 'nullable|file|mimes:jpeg,jpg,png,webp,mp4|max:10240',
        ]);

        return DB::transaction(function () use ($request, $validated) {

            $coverPath = null;
            $coverUrl  = null;

            if ($request->hasFile('cover')) {
                $coverPath = $request->file('cover')->store('event/covers', 'public');
                $coverUrl  = Storage::url($coverPath);
            }

            $event = Event::create([
                'user_id' => Auth::id(),
                ...$validated,
                'bisa_affiliate' => (bool) ($validated['bisa_affiliate'] ?? false),
                'cover'          => $coverPath,
                'cover_url'      => $coverUrl,
                'status'         => 'unpublished',
            ]);

            return redirect()->route('event.show', $event->id);
        });
    }

    // ─────────────────────────────────────
    // SHOW
    // ─────────────────────────────────────
    public function show(Event $event): Response
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }

        $prefix = 'EV-' . $event->id . '-';
        $allPayments = \App\Models\Pembayaran::where('order_id', 'LIKE', $prefix . '%')->get();

        $totalTransaksi   = $allPayments->count();
        $transaksiSukses  = $allPayments->where('status', 'confirmed')->count();
        $transaksiPending = $allPayments->where('status', 'pending')->count();
        $transaksiGagal   = $allPayments->where('status', 'rejected')->count();
        $nominalTransaksi = $allPayments->where('status', 'confirmed')->sum('jumlah');

        $checkoutCount = \App\Models\Pendaftaran::where('registrable_type', 'App\\Models\\Event')
            ->where('registrable_id', $event->id)
            ->count();

        $chartData = [];
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::now()->subDays($i);
            $dayLabel = $dayNames[$date->dayOfWeek];
            $dateStr = $date->toDateString();

            $dayPayments = $allPayments->filter(function ($p) use ($dateStr) {
                return $p->created_at->toDateString() === $dateStr;
            });

            $chartData[] = [
                'day'        => $dayLabel,
                'date'       => $date->format('d M'),
                'Pendapatan' => (float) $dayPayments->where('status', 'confirmed')->sum('jumlah'),
                'Transaksi'  => $dayPayments->count(),
            ];
        }

        $thisWeekRevenue = $allPayments->where('status', 'confirmed')
            ->filter(fn($p) => $p->created_at->gte(\Carbon\Carbon::now()->subDays(7)))
            ->sum('jumlah');
        $lastWeekRevenue = $allPayments->where('status', 'confirmed')
            ->filter(fn($p) => $p->created_at->gte(\Carbon\Carbon::now()->subDays(14)) && $p->created_at->lt(\Carbon\Carbon::now()->subDays(7)))
            ->sum('jumlah');
        $growthPercent = $lastWeekRevenue > 0
            ? round((($thisWeekRevenue - $lastWeekRevenue) / $lastWeekRevenue) * 100)
            : ($thisWeekRevenue > 0 ? 100 : 0);

        $busiestDay = collect($chartData)->sortByDesc('Transaksi')->first();

        $analisis = [
            'total_transaksi'    => $totalTransaksi,
            'transaksi_sukses'   => $transaksiSukses,
            'transaksi_pending'  => $transaksiPending,
            'transaksi_gagal'    => $transaksiGagal,
            'nominal_transaksi'  => (float) $nominalTransaksi,
            'checkout_count'     => $checkoutCount,
            'chart_data'         => $chartData,
            'growth_percent'     => $growthPercent,
            'busiest_day'        => $busiestDay['day'] ?? '-',
        ];

        $transaksi = $allPayments->map(fn($p) => [
            'id'                => $p->id,
            'pelanggan'         => $p->nama_pembeli,
            'email'             => $p->email_pembeli,
            'no_hp'             => $p->no_hp_pembeli,
            'status'            => $p->status === 'confirmed' ? 'Lunas' : ($p->status === 'pending' ? 'Belum Bayar' : ($p->status === 'rejected' ? 'Gagal' : 'Dibatalkan')),
            'metode_pembayaran' => $p->bukti_transfer ? 'Transfer Bank' : 'QRIS',
            'kode_kupon'        => '-',
            'tanggal'           => $p->created_at?->format('d M Y H:i'),
            'resi'              => 'Lihat',
        ]);

        return Inertia::render('event/show', [
            'event' => [
                'id'       => $event->id,
                'name'     => $event->nama,
                'status'   => $event->status,
                'date'     => $event->created_at->format('d M Y'),
                'tipe'     => $event->tipe,
                'lokasi'   => $event->lokasi,
                'lokasi_map' => $event->lokasi_map,
                'deskripsi' => $event->deskripsi,
                'instruksi' => $event->instruksi,
                'syarat_ketentuan' => $event->syarat_ketentuan,
                'cover_url' => $event->cover_url,
                'waktu_mulai' => optional($event->waktu_mulai)->format('d M Y H:i'),
                'waktu_selesai' => optional($event->waktu_selesai)->format('d M Y H:i'),
                'waktu_mulai_jual' => optional($event->waktu_mulai_jual)->format('d M Y H:i'),
                'tanggal_tutup_daftar' => optional($event->tanggal_tutup_daftar)->format('d M Y'),
                'participants' => $event->participants ?? 0,
            ],
            'pesertaList' => $event->pendaftaran()
                ->with('peserta')
                ->get()
                ->map(fn($p) => [
                    'id'     => $p->id,
                    'nama'   => $p->peserta->nama ?? 'Unknown',
                    'email'  => $p->peserta->email ?? 'unknown@example.com',
                    'status' => $p->status,
                    'tanggal_daftar' => $p->created_at->format('d M Y H:i'),
                ]),
            'tiketList' => $event->tiket,
            'pembicaraList' => $event->pembicaras,
            'ratings'     => [],
            'analisis'    => $analisis,
            'transaksi'   => $transaksi,
        ]);
    }

    // ─────────────────────────────────────
    // UPDATE STATUS
    // ─────────────────────────────────────
    public function updateStatus(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:published,unpublished,unlisted',
        ]);

        $event->update([
            'status' => $request->status
        ]);

        return back();
    }

    // ─────────────────────────────────────
    // EDIT
    // ─────────────────────────────────────
    public function edit(Event $event): Response
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('event/edit', [
            'event' => [
                ...$event->toArray(),
                'waktu_mulai' => optional($event->waktu_mulai)->format('Y-m-d\TH:i'),
                'waktu_selesai' => optional($event->waktu_selesai)->format('Y-m-d\TH:i'),
            ]
        ]);
    }

    // ─────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────
    public function update(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama'                    => 'required|string|max:100',
            'deskripsi'               => 'required|string',
            'tipe'                    => 'required|in:online,offline',
            'lokasi'                  => 'nullable|string|max:300',
            'lokasi_map'              => 'nullable|string',
            'waktu_mulai'             => 'required|date',
            'waktu_selesai'           => 'nullable|date|after:waktu_mulai',
            'waktu_mulai_jual'        => 'nullable|date',
            'tanggal_tutup_daftar'    => 'nullable|date',
            'max_tiket_per_transaksi' => 'required|integer|min:1|max:50',
            'instruksi'               => 'nullable|string|max:500',
            'syarat_ketentuan'        => 'nullable|string|max:1000',
            'redirect_url'            => 'nullable|url',
            'bisa_affiliate'          => 'nullable|boolean',
            'cover'                   => 'nullable|file|mimes:jpeg,jpg,png,webp,mp4|max:10240',
        ]);

        return DB::transaction(function () use ($request, $event, $validated) {

            if ($request->hasFile('cover')) {
                if ($event->cover) {
                    Storage::disk('public')->delete($event->cover);
                }

                $coverPath = $request->file('cover')->store('event/covers', 'public');

                $event->cover     = $coverPath;
                $event->cover_url = Storage::url($coverPath);
            }

            $event->update([
                ...$validated,
                'bisa_affiliate' => (bool) ($validated['bisa_affiliate'] ?? false),
            ]);

            return redirect()->route('event.show', $event->id);
        });
    }

    // ─────────────────────────────────────
    // DESTROY
    // ─────────────────────────────────────
    public function destroy(Event $event)
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }

        if ($event->cover) {
            Storage::disk('public')->delete($event->cover);
        }

        $event->delete();

        return redirect()->route('event.index')
            ->with('success', 'Event deleted');
    }


    public function daftar(Event $event)
    {
        $event->pendaftaran()->create([
            'peserta_id' => auth('peserta')->id(),
            'status' => 'pending',
        ]);

        return back()->with('success', 'Berhasil daftar event');
    }

    public function publicShow(Event $event): Response
    {
        if ($event->status !== 'published') {
            abort(404);
        }

        return Inertia::render('event/public', [
            'event' => [
                'id'       => $event->id,
                'name'     => $event->nama,
                'status'   => $event->status,
                'date'     => $event->created_at->format('d M Y'),
                'tipe'     => $event->tipe,
                'lokasi'   => $event->lokasi,
                'lokasi_map' => $event->lokasi_map,
                'deskripsi' => $event->deskripsi,
                'instruksi' => $event->instruksi,
                'syarat_ketentuan' => $event->syarat_ketentuan,
                'cover_url' => $event->cover_url,
                'waktu_mulai' => optional($event->waktu_mulai)->format('d M Y H:i'),
                'waktu_selesai' => optional($event->waktu_selesai)->format('d M Y H:i'),
                'waktu_mulai_jual' => optional($event->waktu_mulai_jual)->format('d M Y H:i'),
                'tanggal_tutup_daftar' => optional($event->tanggal_tutup_daftar)->format('d M Y'),
                'harga' => $event->harga ?? 0,
                'redirect_url' => $event->redirect_url,
            ],
            'tiketList' => $event->tiket,
            'pembicaraList' => $event->pembicaras,
        ]);
    }

    public function catalog()
    {
        $userId = Auth::id();
        $events = Event::where('user_id', $userId)
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($e) => [
                'id' => "event:{$e->id}",
                'product_id' => $e->id,
                'type' => 'event',
                'nama' => $e->nama,
                'harga' => $e->harga ?? 0,
                'status' => $e->status,
                'tanggal' => $e->waktu_mulai ? $e->waktu_mulai->format('d M Y H:i') : $e->created_at->format('d M Y H:i'),
                'terjual' => $e->pendaftaran()->count(),
                'kategori' => 'Event',
            ]);

        return Inertia::render('event/catalog', [
            'produk' => $events,
        ]);
    }

    // ─────────────────────────────────────
    // STORE TIKET
    // ─────────────────────────────────────
    public function storeTiket(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'harga' => 'required|numeric|min:0',
            'kuota' => 'required|integer|min:1',
            'deskripsi' => 'nullable|string',
            'waktu_mulai' => 'required|date',
            'waktu_selesai' => 'nullable|date|after:waktu_mulai',
        ]);

        $tiket = $event->tiket()->create($validated);

        return back()->with('success', 'Tiket berhasil dibuat');
    }

    // ─────────────────────────────────────
    // STORE PEMBICARA
    // ─────────────────────────────────────
    public function storePembicara(Request $request, Event $event)
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'pekerjaan' => 'required|string|max:100',
            'profil' => 'required|string',
            'foto' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:2048',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('event/pembicara', 'public');
        }

        $pembicara = $event->pembicaras()->create([
            'nama' => $validated['nama'],
            'pekerjaan' => $validated['pekerjaan'],
            'profil' => $validated['profil'],
            'foto' => $fotoPath,
        ]);

        return back()->with('success', 'Pembicara berhasil ditambahkan');
    }
}
