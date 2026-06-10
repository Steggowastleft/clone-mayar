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

            // Write CSV headers
            fputcsv($file, ['ID', 'Nama', 'Kategori', 'Harga', 'Status', 'Dibuat Pada']);

            if ($type === 'all' || $type === 'bootcamp') {
                $items = \App\Models\Bootcamp::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->name, 'Bootcamp', $item->harga, $item->status, $item->created_at]);
                }
            }
            if ($type === 'all' || $type === 'kelas-online') {
                $items = \App\Models\KelasOnline::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->nama, 'Kelas Online', $item->harga, $item->status, $item->created_at]);
                }
            }
            if ($type === 'all' || $type === 'webinar') {
                $items = \App\Models\Webinar::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->nama, 'Webinar', $item->harga, $item->status, $item->created_at]);
                }
            }
            if ($type === 'all' || $type === 'produk-digital') {
                $items = \App\Models\ProdukDigital::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->nama, 'Produk Digital', $item->harga, $item->status, $item->created_at]);
                }
            }
            if ($type === 'all' || $type === 'coaching-mentoring') {
                $items = \App\Models\CoachingMentoring::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->nama, 'Coaching & Mentoring', $item->harga, $item->status, $item->created_at]);
                }
            }
            if ($type === 'all' || $type === 'bundling') {
                $items = \App\Models\Bundling::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->nama, 'Bundling', $item->harga, $item->status, $item->created_at]);
                }
            }
            if ($type === 'all' || $type === 'payment-link') {
                $items = \App\Models\PaymentLink::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->title ?? $item->nama ?? '-', 'Link Pembayaran', $item->amount ?? $item->harga ?? 0, $item->status ?? 'active', $item->created_at]);
                }
            }
            if ($type === 'all' || $type === 'penggalangan-dana') {
                $items = \App\Models\PenggalanganDana::where('user_id', $userId)->get();
                foreach ($items as $item) {
                    fputcsv($file, [$item->id, $item->title ?? $item->nama ?? '-', 'Penggalangan Dana', $item->target_amount ?? 0, $item->status ?? 'active', $item->created_at]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
