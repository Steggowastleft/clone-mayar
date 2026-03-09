<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssignmentController extends Controller
{
    public function store(Request $request, Bootcamp $bootcamp)
    {
        $validated = $request->validate([
            'judul'         => 'required|string|max:255',
            'tugas'         => 'required|string',
            'is_wajib'      => 'nullable|boolean',
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'nullable|date|after_or_equal:tanggal_mulai',
            'files.*'       => 'nullable|file|max:1048576', // 1GB
        ]);

        $assignment = $bootcamp->assignments()->create([
            'judul'         => $validated['judul'],
            'tugas'         => $validated['tugas'],
            'is_wajib'      => $request->boolean('is_wajib'),
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_akhir' => $validated['tanggal_akhir'] ?? null,
        ]);

        // Simpan files pendukung
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store("assignments/{$assignment->id}", 'public');
                $assignment->files()->create([
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                ]);
            }
        }

        return back();
    }

    public function update(Request $request, Bootcamp $bootcamp, Assignment $assignment)
    {
        abort_if($assignment->bootcamp_id !== $bootcamp->id, 403);

        $validated = $request->validate([
            'judul'            => 'required|string|max:255',
            'tugas'            => 'required|string',
            'is_wajib'         => 'nullable|boolean',
            'tanggal_mulai'    => 'required|date',
            'tanggal_akhir'    => 'nullable|date|after_or_equal:tanggal_mulai',
            'files.*'          => 'nullable|file|max:1048576',
            'existing_files.*' => 'nullable|integer',
        ]);

        $assignment->update([
            'judul'         => $validated['judul'],
            'tugas'         => $validated['tugas'],
            'is_wajib'      => $request->boolean('is_wajib'),
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_akhir' => $validated['tanggal_akhir'] ?? null,
        ]);

        // Hapus file yang tidak dipertahankan
        $keepIds = $request->input('existing_files', []);
        $assignment->files()->whereNotIn('id', $keepIds)->each(function ($f) {
            Storage::disk('public')->delete($f->path);
            $f->delete();
        });

        // Tambah file baru
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store("assignments/{$assignment->id}", 'public');
                $assignment->files()->create([
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                ]);
            }
        }

        return back();
    }

    public function destroy(Bootcamp $bootcamp, Assignment $assignment)
    {
        abort_if($assignment->bootcamp_id !== $bootcamp->id, 403);

        // Hapus semua file dari storage
        foreach ($assignment->files as $f) {
            Storage::disk('public')->delete($f->path);
        }

        $assignment->delete();

        return back();
    }
}