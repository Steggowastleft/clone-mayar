<?php

namespace App\Http\Controllers;

use App\Models\AccountVerification;
use App\Models\AccountVerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AccountVerificationController extends Controller
{
    public function status()
    {
        $user = Auth::user();
        $verification = AccountVerification::with('documents')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->first();

        return response()->json($verification);
    }

    public function show()
    {
        $user = Auth::user();
        $verification = AccountVerification::with('documents')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->first();

        return response()->json($verification);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $existing = AccountVerification::where('user_id', $user->id)->orderByDesc('created_at')->first();
        if ($existing && $existing->status === 'pending') {
            return redirect()->back()->withErrors(['message' => 'Verifikasi sedang ditinjau admin.'])->with('error', 'Verifikasi sedang ditinjau admin.');
        }
        if ($existing && $existing->status === 'approved') {
            return redirect()->back()->withErrors(['message' => 'Akun sudah terverifikasi.'])->with('error', 'Akun sudah terverifikasi.');
        }

        $types = ['Individu', 'Badan Usaha', 'Yayasan', 'Perseroan Terbatas', 'Perseroan Perorangan'];

        // Validate request; on failure Laravel will automatically redirect back with errors for Inertia
        $validated = $request->validate([
            'verification_type' => 'required|string',
            'legal_name' => 'required|string|max:255',
            'id_number' => 'nullable|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'business_description' => 'nullable|string',
            'business_address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
        ]);

        $documents = $request->file('documents', []);

        // Basic file validation
        foreach ($documents as $key => $file) {
            if (!$file->isValid()) continue;
            $ext = strtolower($file->getClientOriginalExtension());
            if (!in_array($ext, ['jpg','jpeg','png','pdf'])) {
                return redirect()->back()->with('error', 'Tipe file tidak diijinkan: ' . $key);
            }
            if ($file->getSize() / 1024 > 5120) {
                return redirect()->back()->with('error', 'Ukuran file terlalu besar: ' . $key);
            }
        }

        DB::beginTransaction();
        try {
            $verification = AccountVerification::create([
                'user_id' => $user->id,
                'verification_type' => $validated['verification_type'],
                'legal_name' => $validated['legal_name'] ?? null,
                'id_number' => $validated['id_number'] ?? null,
                'business_name' => $validated['business_name'] ?? null,
                'business_description' => $validated['business_description'] ?? null,
                'business_address' => $validated['business_address'] ?? null,
                'website' => $validated['website'] ?? null,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // store documents
            foreach ($documents as $docType => $file) {
                if (!$file || !$file->isValid()) continue;
                $path = $file->store("account-verifications/{$user->id}/{$verification->id}", 'private');
                AccountVerificationDocument::create([
                    'verification_id' => $verification->id,
                    'document_type' => $docType,
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);
            }

            DB::commit();
            // Inertia expects a redirect or render; redirect back with flash message
            return redirect()->back()->with('success', 'Verifikasi terkirim.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan verifikasi.');
        }
    }

    public function downloadDocument(AccountVerificationDocument $document)
    {
        $user = Auth::user();
        // only allow owner or admin
        if ($document->verification->user_id !== $user->id && !($user && method_exists($user, 'hasRole') && $user->hasRole('admin'))) {
            abort(403);
        }

        $path = $document->file_path;
        if (!Storage::disk('private')->exists($path)) {
            abort(404);
        }

        return Storage::disk('private')->response($path);
    }
}
