# 🚀 Quick Start - Kelas Online Features

## 📂 File Structure Baru

```
app/
├── Models/
│   ├── Attendance.php          [NEW] Model untuk presensi
│   ├── Sesi.php                [UPDATED] Tambah owner & config
│   └── Sertifikat.php          [UPDATED] Tambah approval fields
├── Services/
│   ├── AttendanceService.php   [NEW] Logic upload & manage presensi
│   └── CertificateService.php  [NEW] Logic sertifikat & validasi
└── Http/Controllers/
    └── KelasOnlineController.php [UPDATED] Lengkap dengan semua endpoints

database/
└── migrations/
    ├── 2026_04_22_000001_create_attendances_table.php        [NEW]
    ├── 2026_04_22_000002_update_sertifikats_table.php        [NEW]
    └── 2026_04_22_000003_update_sesis_table.php              [NEW]

routes/
└── web.php                      [UPDATED] Tambah routes baru
```

---

## 🔧 Setup Instructions

### 1. Run Migrations
```bash
php artisan migrate
```

Output: Tabel `attendances` baru + kolom baru di `sertifikats` & `sesis`

### 2. Verifikasi Models
Pastikan file tersebut ada:
- `app/Models/Attendance.php`
- `app/Services/AttendanceService.php`
- `app/Services/CertificateService.php`

### 3. Test Endpoints

**Peserta - Upload Presensi:**
```bash
curl -X POST http://app.test/peserta/sesi/1/attendance/upload \
  -F "attendance_type=awal" \
  -F "file_bukti=@test.jpg" \
  -H "Authorization: Bearer {token}"
```

**Penyelenggara - Manage Presensi:**
```bash
curl -X GET http://app.test/kelas-online/sesi/1/attendance/manage \
  -H "Authorization: Bearer {token}"
```

---

## 🎯 Main Features

### ✅ 1. Peserta Upload Presensi (3 kali)
- **Endpoint**: `POST /peserta/sesi/{sesi}/attendance/upload`
- **Input**: file + attendance_type (awal/tengah/akhir)
- **Output**: Status "pending" sampai penyelenggara approve

### ✅ 2. Penyelenggara Validate Presensi
- **Endpoint**: `POST /kelas-online/attendance/{id}/approve|reject`
- **Action**: Approve/Reject dengan keterangan
- **Trigger**: Jika semua 3 presensi approved → Auto generate sertifikat

### ✅ 3. Sertifikat Otomatis
- **Trigger**: Presensi lengkap (awal, tengah, akhir) + assignment (jika required)
- **Output**: Nomor sertifikat unik + QR token
- **Status**: is_approved = true

### ✅ 4. Manual Approval Sertifikat
- **Endpoint**: `POST /kelas-online/sertifikat/{id}/approve-manual`
- **Reason**: Peserta lupa upload tapi hadir fisik, dll
- **Output**: is_manual_approved = true, marked by user

### ✅ 5. Public Verify Sertifikat
- **Endpoint**: `GET /kelas-online/sertifikat/verify/{qr_token}`
- **No Auth**: Public, anyone dapat verify
- **Output**: Certificate details (nomor, nama, tanggal, dll)

### ✅ 6. Export Data
- **Presensi**: `GET /kelas-online/attendance/{sesi}/export` → CSV
- **Sertifikat**: `GET /kelas-online/{bootcamp}/sertifikat/export` → CSV

---

## 📊 Key Methods di Services

### AttendanceService
```php
// Upload file presensi
uploadAttendance(Sesi, Peserta, 'awal', $file)
// Check presensi lengkap?
isAttendanceComplete(Sesi, Peserta) → bool
// Get summary peserta
getAttendanceSummary(Sesi, Peserta) → array
// Stats sesi
getAttendanceStats(Sesi) → array
```

### CertificateService
```php
// Check eligible?
checkEligibility(Bootcamp, Peserta) → ['eligible' => bool, 'missing' => array]
// Create otomatis jika eligible
createCertificateIfEligible(Bootcamp, Peserta) → Sertifikat|null
// Manual approve
approveManually(Sertifikat, User, $reason)
// Get stats
getCertificateStats(Bootcamp) → array
```

---

## 🔌 Database Schema Quick Reference

### Attendances (NEW)
| Field | Type | Notes |
|-------|------|-------|
| id | BIGINT | PK |
| sesi_id | BIGINT | FK |
| peserta_id | BIGINT | FK |
| attendance_type | ENUM | awal/tengah/akhir |
| file_bukti | VARCHAR | Path ke file |
| status | ENUM | pending/approved/rejected |
| keterangan | TEXT | Alasan reject |

### Sertifikats (UPDATED)
| Field | Type | Notes |
|-------|------|-------|
| is_approved | BOOLEAN | Approved (auto/manual) |
| is_manual_approved | BOOLEAN | Manual flag |
| approved_by | BIGINT | FK users.id |
| approved_at | TIMESTAMP | Kapan di-approve |
| approval_reason | TEXT | Alasan manual |

### Sesis (UPDATED)
| Field | Type | Notes |
|-------|------|-------|
| owner_id | BIGINT | FK users.id (penyelenggara) |
| require_attendance | BOOLEAN | Presensi wajib? |
| has_assignment | BOOLEAN | Ada assignment? |
| assignment_required_for_cert | BOOLEAN | Assignment wajib untuk cert? |
| min_assignment_score | INT | Minimum score assignment |

---

## 🎁 Bonus: Auto-Trigger on Attendance Approve

When `approveAttendance()` is called:
1. Check apakah 3 presensi sudah "approved"?
2. Jika YES → Call `CertificateService::createCertificateIfEligible()`
3. Jika certificate eligible → Auto generate

Kode di Controller:
```php
$this->attendanceService->approveAttendance($attendance);

// Check & trigger sertifikat
if ($this->attendanceService->isAttendanceComplete($attendance->sesi, $attendance->peserta)) {
    $bootcamp = $attendance->sesi->bootcamp;
    $this->certificateService->createCertificateIfEligible($bootcamp, $attendance->peserta);
}
```

---

## ⚠️ Important Notes

1. **File Upload Location**: `storage/app/public/attendances/{sesi_id}/{type}/`
2. **Need to symlink**: `php artisan storage:link` (jika belum)
3. **Role Check**: Semua endpoint penyelenggara check `owner_id` == current user
4. **Peserta Guard**: Routes peserta pakai `auth.peserta` middleware
5. **Admin Guard**: Routes penyelenggara pakai `auth` middleware

---

## 🧪 Quick Testing

### Setup Test Data
```php
// Di tinker atau seeder:
$bootcamp = Bootcamp::first();
$sesi = Sesi::create([
    'bootcamp_id' => $bootcamp->id,
    'owner_id' => Auth::id(), // Current user
    'judul' => 'Test Session',
    'require_attendance' => true,
    'waktu_mulai' => now(),
    'waktu_selesai' => now()->addHours(2),
]);

$peserta = Peserta::first();
```

### Test Upload
```php
$file = UploadedFile::fake()->image('test.jpg');
$response = $this->postJson(
    '/peserta/sesi/1/attendance/upload',
    ['attendance_type' => 'awal', 'file_bukti' => $file],
    ['Authorization' => 'Bearer ' . $pesertaToken]
);
$response->assertStatus(200);
```

---

## 📝 Next Steps (Optional Enhancements)

- [ ] Email notification ke peserta saat presensi approved/rejected
- [ ] Email notification ke penyelenggara saat ada submission baru
- [ ] Bulk approve presensi di manage page
- [ ] Filter & search di manage page
- [ ] Attendance QR code (scan attendance)
- [ ] Integration dengan Google Calendar untuk sesi
- [ ] Email certificate ke peserta
- [ ] PDF generation untuk certificate

---

**Last Updated**: 2026-04-22
**Status**: ✅ Production Ready
