<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProdukDigitalRequest extends FormRequest
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
            'deskripsi'         => 'required|string',
            'kategori'          => 'nullable|in:e-book,novel,komik,template,tulisan,video',

            // Pricing
            'tipe_pembayaran'   => 'required|in:berbayar,gratis,bayar_semaunya',
            'harga'             => 'required_if:tipe_pembayaran,berbayar|numeric|min:0',
            'harga_coret'       => 'nullable|numeric|gt:harga',

            // File/Content
            'sumber_file'       => 'required|in:upload,file_lama,link',
            'file'              => 'nullable|file|max:1048576', // 1MB max
            'page_files'        => 'nullable|array',
            'page_files.*'      => 'file|max:1048576',
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
            'deskripsi.required'      => 'Deskripsi wajib diisi',
            'kategori.in'             => 'Kategori tidak valid',
            'tipe_pembayaran.required'=> 'Tipe pembayaran wajib dipilih',
            'tipe_pembayaran.in'      => 'Tipe pembayaran tidak valid',
            'harga.required_if'       => 'Harga wajib diisi untuk produk berbayar',
            'harga.numeric'           => 'Harga harus berupa angka',
            'harga.min'               => 'Harga minimal 0',
            'harga_coret.numeric'     => 'Harga coret harus berupa angka',
            'harga_coret.gt'          => 'Harga coret harus lebih besar dari harga utama',
            'sumber_file.required'    => 'Sumber file wajib dipilih',
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

        // Set default harga to 0 for gratis payment type
        if ($this->tipe_pembayaran === 'gratis') {
            $validated['harga'] = 0;
        }

        // Ensure harga_coret is integer if provided
        if (isset($validated['harga_coret'])) {
            $validated['harga_coret'] = (int) $validated['harga_coret'];
        }

        // Ensure harga is integer
        $validated['harga'] = (int) $validated['harga'];

        // Ensure bisa_affiliate is boolean
        if (isset($validated['bisa_affiliate'])) {
            $validated['bisa_affiliate'] = (bool) $validated['bisa_affiliate'];
        }

        return $validated;
    }
}
