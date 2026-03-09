<?php

namespace App\Http\Controllers\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Bootcamp;
use App\Models\KustomForm;
use App\Models\Pendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PendaftaranController extends Controller
{
    /**
     * Ambil kustom form untuk ditampilkan di popup checkout halaman publik.
     * Endpoint ini diakses via fetch dari frontend (JSON).
     */
    public function getForm(Bootcamp $bootcamp)
    {
        $kustomForm = KustomForm::where('bootcamp_id', $bootcamp->id)
            ->where('is_applied', true)
            ->first();

        return response()->json([
            'fields'     => $kustomForm?->fields ?? [],
            'is_applied' => (bool) $kustomForm?->is_applied,
        ]);
    }

    /**
     * Proses pendaftaran — peserta sudah login.
     */
    public function daftar(Request $request, Bootcamp $bootcamp)
    {
        $peserta = Auth::guard('peserta')->user();

        // Cek sudah daftar belum
        $existing = Pendaftaran::where('bootcamp_id', $bootcamp->id)
            ->where('peserta_id', $peserta->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message'    => 'Anda sudah terdaftar di bootcamp ini.',
                'redirect'   => "/peserta/kelas/{$bootcamp->id}",
            ], 409);
        }

        // Validasi field kustom form jika ada
        $kustomForm = KustomForm::where('bootcamp_id', $bootcamp->id)
            ->where('is_applied', true)
            ->first();

        $formData = [];
        if ($kustomForm && !empty($kustomForm->fields)) {
            foreach ($kustomForm->fields as $field) {
                $key   = $field['id'];
                $value = $request->input($key);

                if ($field['is_required'] && empty($value)) {
                    return response()->json([
                        'errors' => [$key => "Field '{$field['label']}' wajib diisi."],
                    ], 422);
                }

                $formData[$key] = [
                    'label' => $field['label'],
                    'value' => $value,
                    'type'  => $field['type'],
                ];
            }
        }

        // Simpan 3 field wajib (nama, email, no_hp dari profil peserta)
        $formData['nama']  = ['label' => 'Nama',         'value' => $peserta->nama,  'type' => 'single_line'];
        $formData['email'] = ['label' => 'Email',        'value' => $peserta->email, 'type' => 'single_line'];
        $formData['no_hp'] = ['label' => 'No Handphone', 'value' => $peserta->no_hp, 'type' => 'single_line'];

        // Buat pendaftaran — langsung aktif karena gratis
        Pendaftaran::create([
            'bootcamp_id'    => $bootcamp->id,
            'peserta_id'     => $peserta->id,
            'status'         => 'active',
            'form_data'      => $formData,
            'harga_bayar'    => 0,
            'tanggal_aktif'  => now(),
        ]);

        return response()->json([
            'message'  => 'Pendaftaran berhasil!',
            'redirect' => "/peserta/kelas/{$bootcamp->id}",
        ]);
    }
}