# Setup Webinar + Withdrawal Admin Panel + Midtrans Payment

## 📋 Yang Telah Dibuat

### 1. Webinar Catalog & Public Pages
- **Controller**: `WebinarCatalogController` - menampilkan katalog webinar publik
- **Pages**:
  - `/resources/js/Pages/webinar/katalog.tsx` - listing semua webinar
  - `/resources/js/Pages/webinar/checkout.tsx` - form checkout
  - `/resources/js/Pages/webinar/confirmation.tsx` - konfirmasi pembayaran

### 2. Webinar Payment (Midtrans Integration)
- **Controller**: `WebinarPaymentController`
- **Features**:
  - Process pembayaran via Midtrans
  - Callback handling dari Midtrans
  - Validasi pembayaran

### 3. Admin Withdrawal Approval Panel
- **Controller**: `AdminWithdrawalController` (di `/app/Http/Controllers/Admin/`)
- **Model**: `Withdrawal.php`
- **Pages**:
  - `/resources/js/Pages/admin/withdrawal/index.tsx` - list withdrawal requests
  - `/resources/js/Pages/admin/withdrawal/detail.tsx` - detail & approval page
- **Features**:
  - Approve withdrawal
  - Reject withdrawal
  - Mark as completed
  - Statistics dashboard

### 4. Database
- **Migration**: `2024_04_29_create_withdrawals_table.php`
- **Table**: `withdrawals`

### 5. Routes
Semua routes sudah ditambahkan di `routes/web.php`

---

## 🚀 Setup Instructions

### Step 1: Install Midtrans Package
```bash
composer require midtrans/midtrans-php
```

### Step 2: Setup Environment Variables
Tambahkan ke file `.env`:
```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=your_server_key_here
MIDTRANS_CLIENT_KEY=your_client_key_here
MIDTRANS_IS_PRODUCTION=false
```

**Cara mendapatkan keys:**
1. Daftar di https://dashboard.midtrans.com
2. Buat akun Midtrans (Sandbox untuk testing)
3. Ambil Server Key dan Client Key dari Dashboard

### Step 3: Jalankan Migration
```bash
php artisan migrate
```

Atau jika Anda menggunakan fresh install:
```bash
php artisan migrate:fresh
```

### Step 4: Publish Assets (jika diperlukan)
```bash
php artisan vendor:publish
```

### Step 5: Clear Cache
```bash
php artisan config:cache
php artisan cache:clear
```

---

## 📌 Routes yang Tersedia

### Public Routes (Tidak perlu login)
```
GET  /webinar/katalog                           - Katalog webinar publik
GET  /webinar/{id}/detail                       - Detail webinar
GET  /webinar/{id}/checkout                     - Halaman checkout
POST /webinar/{id}/payment/process              - Process pembayaran
POST /webinar/payment/validate                  - Validasi status pembayaran
GET  /webinar/confirmation                      - Halaman konfirmasi
POST /webinar/payment/notification              - Midtrans callback
```

### Admin Routes (Perlu login)
```
GET    /admin/withdrawal                        - List withdrawal requests
GET    /admin/withdrawal/{id}                   - Detail withdrawal
POST   /admin/withdrawal/{id}/approve           - Approve withdrawal
POST   /admin/withdrawal/{id}/reject            - Reject withdrawal
POST   /admin/withdrawal/{id}/mark-completed    - Mark as completed
GET    /admin/withdrawal/stats                  - Statistics
```

---

## 🔧 Konfigurasi Penting

### 1. Midtrans Notification URL
Di Midtrans Dashboard, set Notification URL ke:
```
https://yourdomain.com/webinar/payment/notification
```

### 2. Update User Model (jika diperlukan)
Jika Anda ingin menambahkan relasi withdrawal ke User:

```php
// Di app/Models/User.php
public function withdrawals()
{
    return $this->hasMany(Withdrawal::class);
}
```

### 3. Update Webinar Model (relasi pembayaran)
```php
// Di app/Models/Webinar.php
public function payments()
{
    return $this->hasMany(PaymentLink::class, 'reference_id')
        ->where('type', 'webinar');
}
```

---

## 💳 Cara Kerja Midtrans Integration

### Flow Pembayaran:
1. User klik "Lanjut ke Pembayaran" di halaman checkout
2. Form dikirim ke endpoint `/webinar/{id}/payment/process`
3. Server generate Snap Token dari Midtrans
4. Snap Token ditampilkan ke user (pop-up Midtrans)
5. User melakukan pembayaran
6. Midtrans mengirim callback ke `/webinar/payment/notification`
7. Server update status pembayaran & increment jumlah peserta webinar
8. User diarahkan ke halaman confirmation

### Jenis Pembayaran yang Didukung:
- Transfer Bank
- E-wallet (GCash, OVO, Dana, LinkAja, dll)
- Credit Card
- BNPL
- QR Code (QRIS, GCash, dll)
- Dan lainnya (tergantung konfigurasi Midtrans)

---

## 📊 Admin Withdrawal Panel

### Fitur:
1. **Dashboard Stats**:
   - Total pending withdrawals
   - Total approved
   - Total completed
   - Total rejected

2. **Search & Filter**:
   - Cari berdasarkan nama/email
   - Filter by status

3. **Action Buttons**:
   - Approve dengan catatan
   - Reject dengan alasan
   - Mark as completed (setelah approved)

4. **Timeline**:
   - Tanggal permohonan
   - Tanggal approval/rejection
   - Tanggal selesai

---

## 🔐 Security Considerations

### 1. CSRF Protection
Semua form sudah menggunakan CSRF token dari Inertia

### 2. Authorization
- Admin routes dilindungi middleware `auth`
- Public webinar routes bisa diakses siapa saja (tapi hanya published webinars)

### 3. Midtrans Verification
Callback dari Midtrans sudah verify menggunakan Server Key

### 4. Amount Verification
Pastikan untuk memverifikasi amount saat menerima callback:
```php
if ((int) $transaction->gross_amount === (int) $payment->amount) {
    // Valid, process payment
}
```

---

## 🎯 Next Steps (Opsional)

### 1. Tambahkan Email Notifications
```php
// Di AdminWithdrawalController
Mail::send(new WithdrawalApprovedMail($withdrawal));
Mail::send(new WithdrawalRejectedMail($withdrawal));
```

### 2. Tambahkan Webhook untuk Auto-Transfer
```php
// Di WebinarPaymentController notification()
if ($transaction->transaction_status === 'settlement') {
    // Auto-transfer ke webinar creator
    // Or: Queue a job untuk manual processing
}
```

### 3. Tambahkan Receipt Email
Kirim invoice/receipt ke user setelah membayar

### 4. Analytics & Reports
Dashboard untuk lihat revenue, peserta, etc

### 5. Integrate dengan Bootcamp
Terapkan pattern yang sama ke Bootcamp jika belum punya

---

## 🐛 Troubleshooting

### Midtrans Token tidak generate
- Cek MIDTRANS_SERVER_KEY & CLIENT_KEY di .env
- Pastikan mode (production/sandbox) sesuai

### Callback tidak diterima
- Pastikan notification URL di Midtrans Dashboard sudah correct
- Check server logs: `storage/logs/laravel.log`
- Test menggunakan Midtrans Webhook Tester

### Payment tidak update di database
- Verify Server Key di callback handler
- Cek status transaksi: `capture` atau `settlement` (settle)

### Admin panel tidak bisa diakses
- Pastikan sudah login sebagai admin
- Cek middleware `auth` di routes

---

## 📚 Resources

- **Midtrans Docs**: https://docs.midtrans.com
- **Midtrans Snap**: https://docs.midtrans.com/en/snap/overview
- **Midtrans Dashboard**: https://dashboard.midtrans.com

---

## 📝 TODO Checklist

- [x] Create WebinarCatalogController
- [x] Create WebinarPaymentController (Midtrans)
- [x] Create webinar pages (katalog, checkout, confirmation)
- [x] Create WithdrawalController (Admin)
- [x] Create withdrawal pages (index, detail)
- [x] Create Withdrawal model & migration
- [x] Add routes
- [x] Setup Midtrans config
- [ ] Setup email notifications
- [ ] Setup auto-transfer webhook
- [ ] Add receipt email system
- [ ] Create payment receipt pages
- [ ] Add analytics dashboard
- [ ] Setup proper error handling & logging

---

Generated: April 29, 2026
