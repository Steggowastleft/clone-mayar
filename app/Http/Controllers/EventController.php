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
                    'nama'   => $p->peserta->nama,
                    'email'  => $p->peserta->email,
                    'status' => $p->status,
                    'tanggal_daftar' => $p->created_at->format('d M Y H:i'),
                ]),
            'tiketList' => $event->tiket,
            'pembicaraList' => $event->pembicaras,
            'ratings'     => [],
        ]);
    }

    // ─────────────────────────────────────
    // UPDATE STATUS
    // ─────────────────────────────────────
    public function updateStatus(Request $request, Event $event)
    {
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
