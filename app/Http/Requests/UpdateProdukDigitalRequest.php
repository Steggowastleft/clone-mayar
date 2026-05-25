<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProdukDigitalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            // Basic Information
            'nama'              => 'required|string|max:200',
            'deskripsi'         => 'nullable|string',
            'kategori'          => 'nullable|in:e-book,novel,komik,template,tulisan,video',

            // Pricing - Allow updates
            'tipe_pembayaran'   => 'nullable|in:berbayar,gratis,bayar_semaunya',
            'harga'             => 'nullable|numeric|min:0',
            'harga_coret'       => 'nullable|numeric|gt:harga',

            // File/Content
            'sumber_file'       => 'nullable|in:upload,file_lama,link',
            'file'              => 'nullable|file|max:1048576', // 1MB max
            'file_lama_id'      => 'nullable|string',
            'redirect_url'      => 'nullable|url',

            // Cover
            'cover'             => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240', // 10MB max

            // Dates
            'waktu_mulai_jual'  => 'nullable|date',
            'tanggal_kadaluarsa'=> 'nullable|date',

            // Additional
            'catatan'           => 'nullable|string|max:1000',
            'max_pembayaran'    => 'nullable|integer|min:1',
            'bisa_affiliate'    => 'nullable|boolean',
            
            // Specific Fields
            'author'            => 'nullable|string|max:255',
            'isbn'              => 'nullable|string|max:255',
            'format'            => 'nullable|string|max:255',
            'bahasa'            => 'nullable|string|max:255',
            'jumlah_halaman'    => 'nullable|integer|min:1',
            'tanggal_publish'   => 'nullable|date',
            'bisa_didownload'   => 'nullable|boolean',
            
            'tipe_tulisan'      => 'nullable|in:one_shot,chapter',
            'mekanisme_bayar'   => 'nullable|in:per_chapter,semua_chapter,sekali_bayar',
            'genre'             => 'nullable|string|max:255',
            
            'transkrip'         => 'nullable|string',
            'pembicara'         => 'nullable|string|max:255',
            'durasi'            => 'nullable|string|max:255',
            'artis'             => 'nullable|string|max:255',
            'kategori_produk'   => 'nullable|string|max:255',
            'tipe_pembaca'      => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required'           => 'Nama produk wajib diisi',
            'nama.max'                => 'Nama produk maksimal 200 karakter',
            'kategori.in'             => 'Kategori tidak valid',
            'tipe_pembayaran.in'      => 'Tipe pembayaran tidak valid',
            'harga.numeric'           => 'Harga harus berupa angka',
            'harga.min'               => 'Harga minimal 0',
            'harga_coret.numeric'     => 'Harga coret harus berupa angka',
            'harga_coret.gt'          => 'Harga coret harus lebih besar dari harga utama',
            'sumber_file.in'          => 'Sumber file tidak valid',
            'file.file'               => 'File harus berupa file',
            'file.max'                => 'File maksimal 1MB',
            'cover.mimes'             => 'Cover harus berupa jpg, jpeg, png, atau webp',
            'cover.max'               => 'Cover maksimal 10MB',
            'waktu_mulai_jual.date'   => 'Waktu mulai jual harus berupa tanggal',
            'tanggal_kadaluarsa.date' => 'Tanggal kadaluarsa harus berupa tanggal',
            'catatan.max'             => 'Catatan maksimal 1000 karakter',
            'max_pembayaran.integer'  => 'Maksimal pembayaran harus berupa angka',
            'max_pembayaran.min'      => 'Maksimal pembayaran minimal 1',
            'redirect_url.url'        => 'URL redirect harus berupa URL yang valid',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        // Ensure harga_coret is integer if provided
        if (isset($validated['harga_coret']) && $validated['harga_coret'] !== null) {
            $validated['harga_coret'] = (int) $validated['harga_coret'];
        }

        // Ensure harga is integer if provided
        if (isset($validated['harga']) && $validated['harga'] !== null) {
            $validated['harga'] = (int) $validated['harga'];
        }

        // Ensure bisa_affiliate is boolean if provided
        if (isset($validated['bisa_affiliate']) && $validated['bisa_affiliate'] !== null) {
            $validated['bisa_affiliate'] = (bool) $validated['bisa_affiliate'];
        }

        return $validated;
    }
}
