# Dokumentasi Fitur Semua Produk (All Products)

## Overview
Fitur "Semua Produk" adalah agregator unified yang menampilkan semua produk dari berbagai tipe dalam satu halaman.

## Fitur yang Tersedia

### 1. **Index Page** (`/semua-produk`)
- Menampilkan semua produk dari berbagai tipe
- Filter berdasarkan status (Published, Unpublished, Unlisted)
- Filter berdasarkan kategori/tipe produk
- Search/search untuk mencari produk
- Tombol "+ BUAT" untuk membuat produk baru

### 2. **Create Page** (`/semua-produk/create`)
- Memilih jenis produk yang akan dibuat
- Tersedia untuk: Webinar, Event, Kelas Online, Produk Digital, Link Pembayaran
- Setiap pilihan akan redirect ke halaman create spesifik untuk tipe produk tersebut

### 3. **Show/Detail Page** (`/semua-produk/{id}`)
- Menampilkan detail informasi produk
- Menampilkan nama, tipe, harga, status, deskripsi
- Tombol "Buka Detail" untuk edit di halaman spesifik
- Tombol "Hapus" untuk menghapus produk

### 4. **Edit Page** (`/semua-produk/{id}/edit`)
- Auto-redirect ke halaman edit spesifik untuk tipe produk tersebut

## Tipe-Tipe Produk yang Didukung

| Tipe | Label | Route | Color |
|------|-------|-------|-------|
| `webinar` | Webinar | `/webinar/{id}` | Blue |
| `event` | Event | `/event/{id}` | Purple |
| `bootcamp` | Kelas Online | `/bootcamps/{id}` | Green |
| `produk-digital` | Produk Digital | `/produk-digital/{id}` | Orange |
| `payment-link` | Link Pembayaran | `/payment-link/{id}` | Red |

## Format ID
Composite ID menggunakan format `type:product_id` dengan separator colon (:)
- Contoh: `webinar:1`, `event:5`, `produk_digital:3`, `payment_link:2`, `bootcamp:7`
- Underscore di tipe (produk_digital, payment_link) di-convert menjadi hyphen (produk-digital, payment-link)

## Database Integration

### Tabel yang Diakses:
- `webinars` - untuk produk Webinar
- `events` - untuk produk Event
- `bootcamps` - untuk produk Kelas Online
- `produkdigitals` - untuk produk Digital
- `payment_links` - untuk Link Pembayaran

### User Authorization:
Semua query memfilter berdasarkan `user_id` yang login untuk keamanan.

## File Structure

```
resources/js/Pages/semua-produk/
├── index.tsx          # List semua produk
├── create.tsx         # Pilih tipe produk
├── show.tsx           # Detail produk
└── edit.tsx           # Redirect ke edit spesifik

app/Http/Controllers/
└── SemuaProdukController.php  # Controller untuk aggregation
```

## Fitur-Fitur

✅ **Aggregation dari Multiple Sources**
- Mengambil data dari 5 tabel berbeda
- Menampilkan dalam satu list terurut

✅ **Filter & Search**
- Filter berdasarkan status
- Filter berdasarkan kategori/tipe
- Search by nama produk

✅ **Navigation**
- Mudah beralih antara view list dan detail
- Direct links ke edit halaman spesifik setiap tipe

✅ **Status Management**
- Menampilkan status (Published, Unpublished, Unlisted)
- Color-coded badges untuk visual clarity

## Cara Penggunaan

### Melihat Semua Produk
```
GET /semua-produk
```

### Membuat Produk Baru
```
GET /semua-produk/create  # Pilih tipe
POST /semua-produk        # Redirect ke tipe spesifik
```

### Melihat Detail Produk
```
GET /semua-produk/{type:product_id}  # e.g., /semua-produk/webinar:1
```

### Edit Produk
```
GET /semua-produk/{type:product_id}/edit  # Auto-redirect
```

### Hapus Produk
```
DELETE /semua-produk/{type:product_id}  # Redirect ke list
```

## Routing
Semua routes sudah terdefinisi di `routes/web.php`:
```php
Route::get('semua-produk', [SemuaProdukController::class, 'index'])->name('semua-produk.index');
Route::get('semua-produk/create', [SemuaProdukController::class, 'create'])->name('semua-produk.create');
Route::post('semua-produk', [SemuaProdukController::class, 'store'])->name('semua-produk.store');
Route::get('semua-produk/{id}', [SemuaProdukController::class, 'show'])->name('semua-produk.show');
Route::get('semua-produk/{id}/edit', [SemuaProdukController::class, 'edit'])->name('semua-produk.edit');
Route::put('semua-produk/{id}', [SemuaProdukController::class, 'update'])->name('semua-produk.update');
Route::delete('semua-produk/{id}', [SemuaProdukController::class, 'destroy'])->name('semua-produk.destroy');
```

## UI Components

- **DashboardLayout** - Layout utama
- **Button** - Action buttons
- **Input** - Search input
- **Badge** - Status badges
- **Icons** - Lucide icons untuk visual

## Notes untuk Development

1. Untuk menambah tipe produk baru:
   - Update `getAllProducts()` method di controller
   - Tambahkan entry baru di `typeConfig` di React components
   - Update routes jika diperlukan

2. Untuk mengubah format tampilan:
   - Edit `index.tsx` untuk list view
   - Edit `show.tsx` untuk detail view

3. Untuk menambah filter:
   - Update filter logic di `index.tsx`
   - Add filter options di UI

---

**Last Updated**: April 20, 2026
