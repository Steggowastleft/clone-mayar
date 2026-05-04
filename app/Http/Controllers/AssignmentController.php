<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\KelasOnline;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssignmentController extends Controller
{
    /**
     * Store for Bootcamp
     */
    public function store(Request $request, Bootcamp $bootcamp)
    {
        $validated = $this->validateAssignment($request);

        $assignment = $bootcamp->assignments()->create([
            'judul'          => $validated['judul'],
            'tugas'          => $validated['tugas'],
            'is_wajib'       => $request->boolean('is_wajib'),
            'is_tugas_akhir' => $request->boolean('is_tugas_akhir'),
            'tipe'           => $request->input('tipe', 'upload'),
            'tanggal_mulai'  => $validated['tanggal_mulai'],
            'tanggal_akhir'  => $validated['tanggal_akhir'] ?? null,
        ]);

        $this->handleFiles($request, $assignment);

        return back();
    }

    /**
     * Store for Kelas Online
     */
    public function storeForKelasOnline(Request $request, $kelasId)
    {
        $kelas = KelasOnline::findOrFail($kelasId);
        $validated = $this->validateAssignment($request);

        $assignment = $kelas->assignments()->create([
            'judul'          => $validated['judul'],
            'tugas'          => $validated['tugas'],
            'is_wajib'       => $request->boolean('is_wajib'),
            'is_tugas_akhir' => $request->boolean('is_tugas_akhir'),
            'tipe'           => $request->input('tipe', 'upload'),
            'tanggal_mulai'  => $validated['tanggal_mulai'],
            'tanggal_akhir'  => $validated['tanggal_akhir'] ?? null,
        ]);

        $this->handleFiles($request, $assignment);

        return back();
    }

    /**
     * Update for Bootcamp
     */
    public function update(Request $request, Bootcamp $bootcamp, Assignment $assignment)
    {
        abort_if($assignment->bootcamp_id !== $bootcamp->id, 403);
        
        $validated = $this->validateAssignment($request, true);
        $this->updateAssignment($request, $assignment, $validated);

        return back();
    }

    /**
     * Update for Kelas Online
     */
    public function updateForKelasOnline(Request $request, $kelasId, Assignment $assignment)
    {
        abort_if($assignment->kelas_online_id !== (int)$kelasId, 403);

        $validated = $this->validateAssignment($request, true);
        $this->updateAssignment($request, $assignment, $validated);

        return back();
    }

    /**
     * Destroy for Bootcamp
     */
    public function destroy(Bootcamp $bootcamp, Assignment $assignment)
    {
        abort_if($assignment->bootcamp_id !== $bootcamp->id, 403);
        $this->deleteAssignment($assignment);

        return back();
    }

    /**
     * Destroy for Kelas Online
     */
    public function destroyForKelasOnline($kelasId, Assignment $assignment)
    {
        abort_if($assignment->kelas_online_id !== (int)$kelasId, 403);
        $this->deleteAssignment($assignment);

        return back();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    protected function validateAssignment(Request $request, $isUpdate = false)
    {
        $rules = [
            'judul'         => 'required|string|max:255',
            'tugas'         => 'required|string',
            'is_wajib'      => 'nullable|boolean',
            'is_tugas_akhir' => 'nullable|boolean',
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'nullable|date|after_or_equal:tanggal_mulai',
            'tipe'          => 'nullable|in:upload,quiz',
            'files.*'       => 'nullable|file|max:1048576',
        ];

        if ($isUpdate) {
            $rules['existing_files.*'] = 'nullable|integer';
        }

        return $request->validate($rules);
    }

    protected function handleFiles(Request $request, Assignment $assignment)
    {
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
    }

    protected function updateAssignment(Request $request, Assignment $assignment, $validated)
    {
        $assignment->update([
            'judul'          => $validated['judul'],
            'tugas'          => $validated['tugas'],
            'is_wajib'       => $request->boolean('is_wajib'),
            'is_tugas_akhir' => $request->boolean('is_tugas_akhir'),
            'tipe'           => $request->input('tipe', 'upload'),
            'tanggal_mulai'  => $validated['tanggal_mulai'],
            'tanggal_akhir'  => $validated['tanggal_akhir'] ?? null,
        ]);

        // Hapus file yang tidak dipertahankan
        $keepIds = $request->input('existing_files', []);
        $assignment->files()->whereNotIn('id', $keepIds)->each(function ($f) {
            Storage::disk('public')->delete($f->path);
            $f->delete();
        });

        // Tambah file baru
        $this->handleFiles($request, $assignment);
    }

    protected function deleteAssignment(Assignment $assignment)
    {
        foreach ($assignment->files as $f) {
            Storage::disk('public')->delete($f->path);
        }
        $assignment->delete();
    }
}