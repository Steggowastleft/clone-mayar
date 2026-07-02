<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class PengaturanController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Inertia::render('pengaturan/index', [
            'user' => [
                'name'    => $user->name,
                'email'   => $user->email,
                'no_hp'   => $user->no_hp   ?? '',
                'bio'     => $user->bio      ?? '',
                'website' => $user->website  ?? '',
            ],
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->input('type', 'all');
        $userId = auth()->id();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="ekspor_' . $type . '_' . date('Ymd_His') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($type, $userId) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            if ($type === 'all') {
                fputcsv($file, [
                    'ID Produk', 
                    'Nama Produk', 
                    'Jenis Produk', 
                    'Kategori/Tipe', 
                    'Harga (Formatted)', 
                    'Harga (Numerik)', 
                    'Status', 
                    'Statistik (Peserta/Penjualan/Unduhan)', 
                    'Keterangan Tambahan', 
                    'Tanggal Dibuat'
                ]);

                // Bootcamp
                $items = \App\Models\Bootcamp::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [
                        $item->id, 
                        $item->name, 
                        'Pelatihan', 
                        $item->kategori ?? '-', 
                        'Rp ' . number_format($item->harga, 0, ',', '.'), 
                        (int) $item->harga,
                        ucfirst($item->status), 
                        ($item->participants ?? 0) . ' Peserta', 
                        'Batch: ' . ($item->batch ?? '-'), 
                        $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                    ]);
                }

                // Kelas Online
                $items = \App\Models\KelasOnline::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [
                        $item->id, 
                        $item->nama, 
                        'Kelas Online', 
                        $item->is_gratis ? 'Gratis' : 'Berbayar', 
                        'Rp ' . number_format($item->harga, 0, ',', '.'), 
                        (int) $item->harga,
                        ucfirst($item->status), 
                        ($item->pesertaTerdaftar()->count()) . ' Peserta', 
                        'Wajib Sertifikat: ' . ($item->require_quiz_sertifikat ? 'Ya' : 'Tidak'), 
                        $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                    ]);
                }

                // Webinar
                $items = \App\Models\Webinar::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [
                        $item->id, 
                        $item->nama, 
                        'Webinar', 
                        $item->harga > 0 ? 'Berbayar' : 'Gratis', 
                        'Rp ' . number_format($item->harga, 0, ',', '.'), 
                        (int) $item->harga,
                        ucfirst($item->status), 
                        ($item->peserta ?? 0) . ' Pendaftar', 
                        'Mulai: ' . ($item->tanggal_mulai ? $item->tanggal_mulai->format('d M Y H:i') . ' WIB' : '-'), 
                        $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                    ]);
                }

                // Produk Digital
                $items = \App\Models\ProdukDigital::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [
                        $item->id, 
                        $item->nama, 
                        'Produk Digital', 
                        $item->kategori ?? 'E-Book', 
                        'Rp ' . number_format($item->harga, 0, ',', '.'), 
                        (int) $item->harga,
                        ucfirst($item->status), 
                        ($item->total_penjualan ?? 0) . ' Terjual', 
                        'Sumber: ' . $item->sumber_file, 
                        $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                    ]);
                }

                // Event / Acara
                $items = \App\Models\Event::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    $tiketPrices = $item->tiket()->pluck('harga');
                    if ($tiketPrices->isEmpty()) {
                        $priceText = 'Gratis';
                        $rawPrice = 0;
                    } else {
                        $minPrice = $tiketPrices->min();
                        $maxPrice = $tiketPrices->max();
                        if ($minPrice == $maxPrice) {
                            $priceText = 'Rp ' . number_format($minPrice, 0, ',', '.');
                            $rawPrice = $minPrice;
                        } else {
                            $priceText = 'Rp ' . number_format($minPrice, 0, ',', '.') . ' - Rp ' . number_format($maxPrice, 0, ',', '.');
                            $rawPrice = $minPrice;
                        }
                    }

                    fputcsv($file, [
                        $item->id, 
                        $item->nama, 
                        'Kegiatan / Acara', 
                        ucfirst($item->tipe ?? 'Publik'), 
                        $priceText, 
                        (int) $rawPrice,
                        ucfirst($item->status ?? 'Published'), 
                        ($item->participants ?? 0) . ' Peserta', 
                        'Lokasi: ' . ($item->lokasi ?? '-'), 
                        $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                    ]);
                }

                // Payment Link
                $items = \App\Models\PaymentLink::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [
                        $item->id, 
                        $item->nama, 
                        'Link Pembayaran', 
                        '-', 
                        'Rp ' . number_format($item->harga, 0, ',', '.'), 
                        (int) $item->harga,
                        ucfirst($item->status), 
                        '-', 
                        'Slug: ' . $item->slug, 
                        $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                    ]);
                }

                // Penggalangan Dana
                $items = \App\Models\PenggalanganDana::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [
                        $item->id, 
                        $item->title ?? $item->nama ?? '-', 
                        'Penggalangan Dana', 
                        '-', 
                        'Rp ' . number_format($item->target_amount ?? 0, 0, ',', '.'), 
                        (int) ($item->target_amount ?? 0),
                        ucfirst($item->status), 
                        'Terkumpul: Rp ' . number_format($item->collected_amount ?? 0, 0, ',', '.'), 
                        '-', 
                        $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                    ]);
                }
            } else {
                if ($type === 'kelas-online') {
                    fputcsv($file, ['ID Kelas', 'Nama Kelas', 'Tipe Pembayaran', 'Harga (Formatted)', 'Harga (Numerik)', 'Wajib Quiz & Sertifikat', 'Batas Nilai Quiz', 'Memiliki Tugas', 'Total Peserta Terdaftar', 'Tanggal Mulai', 'Tanggal Selesai', 'Tanggal Dibuat']);
                    $items = \App\Models\KelasOnline::where('user_id', $userId)->get();
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id, 
                            $item->nama, 
                            $item->is_gratis ? 'Gratis' : 'Berbayar', 
                            'Rp ' . number_format($item->harga, 0, ',', '.'), 
                            (int) $item->harga,
                            $item->require_quiz_sertifikat ? 'Ya' : 'Tidak', 
                            $item->nilai_minimum_quiz ?? '-', 
                            $item->has_assignment ? 'Ya' : 'Tidak', 
                            $item->pesertaTerdaftar()->count(), 
                            $item->tanggal_mulai ? $item->tanggal_mulai->format('d M Y') : '-', 
                            $item->tanggal_selesai ? $item->tanggal_selesai->format('d M Y') : '-', 
                            $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                        ]);
                    }
                }
                if ($type === 'bootcamp') {
                    fputcsv($file, ['ID Pelatihan', 'Nama Pelatihan', 'Batch', 'Kategori', 'Tipe Pembayaran', 'Harga (Formatted)', 'Harga (Numerik)', 'Harga Coret (Formatted)', 'Harga Coret (Numerik)', 'Batas Nilai Quiz', 'Kapasitas Maksimal', 'Total Peserta', 'Tanggal Mulai Jual', 'Tanggal Tutup Daftar', 'Tanggal Dibuat']);
                    $items = \App\Models\Bootcamp::where('user_id', $userId)->get();
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id, 
                            $item->name, 
                            $item->batch ?? '-', 
                            $item->kategori ?? '-', 
                            $item->tipe_pembayaran ?? 'Berbayar', 
                            'Rp ' . number_format($item->harga, 0, ',', '.'), 
                            (int) $item->harga,
                            $item->harga_coret ? 'Rp ' . number_format($item->harga_coret, 0, ',', '.') : '-', 
                            (int) $item->harga_coret,
                            $item->batas_nilai_quiz ?? '-', 
                            $item->max_peserta ?? 'Tak Terbatas', 
                            $item->participants ?? 0, 
                            $item->tanggal_mulai_jual ? $item->tanggal_mulai_jual->format('d M Y') : '-', 
                            $item->tanggal_tutup_daftar ? $item->tanggal_tutup_daftar->format('d M Y') : '-', 
                            $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                        ]);
                    }
                }
                if ($type === 'webinar') {
                    fputcsv($file, ['ID Webinar', 'Nama Webinar', 'Tipe Pembayaran', 'Harga Tiket (Formatted)', 'Harga Tiket (Numerik)', 'Harga Coret (Formatted)', 'Harga Coret (Numerik)', 'Kapasitas Maksimal', 'Total Pendaftar', 'Waktu Mulai', 'Waktu Selesai', 'Link Virtual Room', 'Zona Waktu', 'Tanggal Dibuat']);
                    $items = \App\Models\Webinar::where('user_id', $userId)->get();
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id, 
                            $item->nama, 
                            $item->harga > 0 ? 'Berbayar' : 'Gratis', 
                            'Rp ' . number_format($item->harga, 0, ',', '.'), 
                            (int) $item->harga,
                            $item->harga_coret ? 'Rp ' . number_format($item->harga_coret, 0, ',', '.') : '-', 
                            (int) $item->harga_coret,
                            $item->max_peserta ?? 'Tak Terbatas', 
                            $item->peserta ?? 0, 
                            $item->tanggal_mulai ? $item->tanggal_mulai->format('d M Y H:i') . ' WIB' : '-', 
                            $item->tanggal_selesai ? $item->tanggal_selesai->format('d M Y H:i') . ' WIB' : '-', 
                            $item->url ?? '-', 
                            $item->timezone ?? 'Asia/Jakarta', 
                            $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                        ]);
                    }
                }
                if ($type === 'produk-digital') {
                    fputcsv($file, ['ID Produk', 'Nama Produk', 'Kategori', 'Tipe Pembayaran', 'Harga Jual (Formatted)', 'Harga Jual (Numerik)', 'Harga Coret (Formatted)', 'Harga Coret (Numerik)', 'Total Penjualan', 'Sumber File', 'Nama File/Tautan', 'Penulis/Artis', 'ISBN', 'Bahasa', 'Jumlah Halaman', 'Bisa Didownload', 'Tanggal Dibuat']);
                    $items = \App\Models\ProdukDigital::where('user_id', $userId)->get();
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id, 
                            $item->nama, 
                            $item->kategori ?? 'E-Book', 
                            $item->tipe_pembayaran, 
                            'Rp ' . number_format($item->harga, 0, ',', '.'), 
                            (int) $item->harga,
                            $item->harga_coret ? 'Rp ' . number_format($item->harga_coret, 0, ',', '.') : '-', 
                            (int) $item->harga_coret,
                            $item->total_penjualan, 
                            $item->sumber_file, 
                            $item->file_url ?? basename($item->file_path ?? '') ?: '-', 
                            $item->author ?? $item->artis ?? '-', 
                            $item->isbn ?? '-', 
                            $item->bahasa ?? 'Indonesia', 
                            $item->jumlah_halaman ?? '-', 
                            $item->bisa_didownload ? 'Ya' : 'Tidak', 
                            $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                        ]);
                    }
                }
                if ($type === 'event') {
                    fputcsv($file, ['ID Event', 'Nama Event', 'Tipe', 'Lokasi', 'Harga Terendah (Formatted)', 'Harga Terendah (Numerik)', 'Waktu Mulai', 'Waktu Selesai', 'Batas Tiket Per Transaksi', 'Bisa Affiliate', 'Status', 'Total Tiket Terdaftar', 'Tanggal Dibuat']);
                    $items = \App\Models\Event::where('user_id', $userId)->get();
                    foreach ($items as $item) {
                        $tiketPrices = $item->tiket()->pluck('harga');
                        $minPrice = $tiketPrices->min() ?? 0;
                        fputcsv($file, [
                            $item->id, 
                            $item->nama, 
                            ucfirst($item->tipe ?? 'Publik'), 
                            $item->lokasi ?? '-', 
                            'Rp ' . number_format($minPrice, 0, ',', '.'), 
                            (int) $minPrice,
                            $item->waktu_mulai ? $item->waktu_mulai->format('d M Y H:i') . ' WIB' : '-', 
                            $item->waktu_selesai ? $item->waktu_selesai->format('d M Y H:i') . ' WIB' : '-', 
                            $item->max_tiket_per_transaksi ?? '-', 
                            $item->bisa_affiliate ? 'Ya' : 'Tidak', 
                            ucfirst($item->status ?? 'Published'), 
                            $item->participants ?? 0, 
                            $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                        ]);
                    }
                }
                if ($type === 'payment-link') {
                    fputcsv($file, ['ID Link', 'Nama Tagihan', 'Status', 'Nominal Pembayaran (Formatted)', 'Nominal Pembayaran (Numerik)', 'Harga Coret (Formatted)', 'Harga Coret (Numerik)', 'Slug Tautan', 'Maksimum Transaksi', 'Dapat Affiliate', 'Tanggal Kadaluarsa', 'Tanggal Dibuat']);
                    $items = \App\Models\PaymentLink::where('user_id', $userId)->get();
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id, 
                            $item->nama, 
                            ucfirst($item->status), 
                            'Rp ' . number_format($item->harga, 0, ',', '.'), 
                            (int) $item->harga,
                            $item->harga_coret ? 'Rp ' . number_format($item->harga_coret, 0, ',', '.') : '-', 
                            (int) $item->harga_coret,
                            $item->slug, 
                            $item->maksimum_pembayaran ?? 'Tak Terbatas', 
                            $item->bisa_affiliate ? 'Ya' : 'Tidak', 
                            $item->tanggal_kadaluarsa ? $item->tanggal_kadaluarsa->format('d M Y') : 'Tidak Ada', 
                            $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                        ]);
                    }
                }
                if ($type === 'penggalangan-dana') {
                    fputcsv($file, ['ID Kampanye', 'Judul Kampanye', 'Status', 'Target Dana (Formatted)', 'Target Dana (Numerik)', 'Terkumpul (Formatted)', 'Terkumpul (Numerik)', 'Tutup Otomatis', 'Bisa Affiliate', 'Tanggal Dibuat']);
                    $items = \App\Models\PenggalanganDana::where('user_id', $userId)->get();
                    foreach ($items as $item) {
                        fputcsv($file, [
                            $item->id, 
                            $item->title ?? $item->nama ?? '-', 
                            ucfirst($item->status), 
                            'Rp ' . number_format($item->target_amount ?? 0, 0, ',', '.'), 
                            (int) ($item->target_amount ?? 0),
                            'Rp ' . number_format($item->collected_amount ?? 0, 0, ',', '.'), 
                            (int) ($item->collected_amount ?? 0),
                            $item->auto_close ? 'Ya' : 'Tidak', 
                            $item->bisa_affiliate ? 'Ya' : 'Tidak', 
                            $item->created_at ? $item->created_at->format('d M Y H:i') . ' WIB' : '-'
                        ]);
                    }
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function eksporDataPage()
    {
        $userId = auth()->id();
        return Inertia::render('ekspor/index', [
            'counts' => [
                'all' => (int) (\App\Models\KelasOnline::where('user_id', $userId)->count() +
                         \App\Models\Bootcamp::where('user_id', $userId)->count() +
                         \App\Models\Webinar::where('user_id', $userId)->count() +
                         \App\Models\ProdukDigital::where('user_id', $userId)->count() +
                         \App\Models\Event::where('user_id', $userId)->count() +
                         \App\Models\PaymentLink::where('user_id', $userId)->count() +
                         \App\Models\PenggalanganDana::where('user_id', $userId)->count()),
                'kelas-online' => (int) \App\Models\KelasOnline::where('user_id', $userId)->count(),
                'bootcamp' => (int) \App\Models\Bootcamp::where('user_id', $userId)->count(),
                'webinar' => (int) \App\Models\Webinar::where('user_id', $userId)->count(),
                'produk-digital' => (int) \App\Models\ProdukDigital::where('user_id', $userId)->count(),
                'event' => (int) \App\Models\Event::where('user_id', $userId)->count(),
                'payment-link' => (int) \App\Models\PaymentLink::where('user_id', $userId)->count(),
                'penggalangan-dana' => (int) \App\Models\PenggalanganDana::where('user_id', $userId)->count(),
            ]
        ]);
    }
}
