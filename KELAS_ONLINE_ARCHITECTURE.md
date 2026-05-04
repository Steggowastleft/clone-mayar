# 📋 Implementation Flow & Architecture

## 🔄 System Flow Diagram

### 1. Peserta Upload Presensi Flow
```
┌─────────────────────────────────────────────────────────────┐
│                  PESERTA PRESENSI FLOW                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Peserta    │
│ Membuka      │
│ Kelas Sesi   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  showAttendancePage()    │ GET /peserta/sesi/{sesi}/attendance
│  - Display page          │
│  - Show status (awal/    │
│    tengah/akhir)         │
│  - Show buttons: upload  │
└──────┬───────────────────┘
       │
       ▼ (Click "Upload Bukti")
┌─────────────────────────────────┐
│  uploadAttendance()             │ POST /peserta/sesi/{sesi}/attendance/upload
│  - Validate file (jpg/png/pdf)  │
│  - Save to storage              │
│  - Create Attendance record     │
│  - Status = "pending"           │
└──────┬────────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│  Poll getAttendanceStatus()    │ GET /peserta/sesi/{sesi}/attendance/status
│  - Check latest status         │
│  - Show "Pending" in UI        │
└────────────────────────────────┘
```

### 2. Penyelenggara Validate & Approve Flow
```
┌──────────────────────────────────────────────────────────────┐
│           PENYELENGGARA VALIDATE PRESENSI FLOW               │
└──────────────────────────────────────────────────────────────┘

┌──────────────┐
│Penyelenggara │
│ Buka Manage  │
│ Presensi     │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────┐
│  manageAttendance()                    │ GET /kelas-online/sesi/{sesi}/attendance/manage
│  - List semua attendance pending       │
│  - Show file bukti                     │
│  - Show approve/reject buttons         │
│  - Show stats                          │
└────────┬───────────────────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼ (Click Approve)                 ▼ (Click Reject)
    ┌─────────────────┐              ┌──────────────────┐
    │approveAttendance│              │rejectAttendance  │
    │ - Status=       │              │ - Status=        │
    │   "approved"    │              │   "rejected"     │
    │ - Update DB     │              │ - Add keterangan │
    └────────┬────────┘              │ - Update DB      │
             │                       └──────────────────┘
             │
             ▼ (Trigger auto-check)
    ┌───────────────────────────────────────┐
    │ isAttendanceComplete()?               │
    │ Check: awal? tengah? akhir? approved?│
    └───────┬──────────────────┬────────────┘
            │                  │
         YES│                  │NO
            ▼                  ▼
    ┌──────────────────────┐ (Continue)
    │ AUTO GENERATE CERT   │
    │ - generateNomor()    │
    │ - generateQrToken()  │
    │ - Create record      │
    │ - is_approved=true   │
    └──────────────────────┘
```

### 3. Sertifikat Auto-Generation Flow
```
┌──────────────────────────────────────────────────────┐
│          AUTO-GENERATE CERTIFICATE FLOW              │
└──────────────────────────────────────────────────────┘

Trigger: All 3 attendances approved
         
         │
         ▼
┌─────────────────────────────────────────┐
│  checkEligibility(Bootcamp, Peserta)    │
│  - Check presensi lengkap?              │
│  - Check assignment (if required)?      │
│  - Check min score (if required)?       │
└────────┬────────────────────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
      YES│                                 │NO
         ▼                                 ▼
    ┌──────────────────────────┐  (Skip)
    │ createCertificateIfE...  │
    │ - Generate nomor         │
    │ - Generate QR token      │
    │ - Create record          │
    │ - is_approved = true     │
    │ - is_manual_approved = 0 │
    └──────────┬───────────────┘
               │
               ▼
         ✅ SERTIFIKAT READY
              (Peserta bisa download)
```

### 4. Manual Approval Flow (Exception Case)
```
┌────────────────────────────────────────────────────┐
│         MANUAL APPROVAL EXCEPTION FLOW              │
└────────────────────────────────────────────────────┘

Peserta:
"Saya hadir tapi lupa upload bukti"
         │
         ▼
Penyelenggara:
1. Buka Manage Sertifikat
2. Lihat peserta yang pending
3. Review: apakah alasan valid?
4. Klik "Approve Manual"
         │
         ▼
┌────────────────────────────────────────┐
│  manualApproveCertificate()            │
│  - is_approved = true                  │
│  - is_manual_approved = true           │
│  - approved_by = penyelenggara_id      │
│  - approved_at = now()                 │
│  - approval_reason = input alasan      │
└────────────────────────────────────────┘
         │
         ▼
✅ SERTIFIKAT ACCEPTED (MANUAL)
   Audit trail: siapa approve, kapan, alasannya
```

### 5. Public Certificate Verification Flow
```
┌─────────────────────────────────────────────────────┐
│         PUBLIC CERT VERIFICATION FLOW                │
└─────────────────────────────────────────────────────┘

Orang lain:
"Saya mau verifikasi sertifikat peserta"
         │
         ▼ (Scan QR atau paste link)
┌──────────────────────────────────────────┐
│  /kelas-online/sertifikat/verify/{qrtoken}
│  - No authentication needed              │
│  - Lookup by qr_token                    │
│  - Check is_approved?                    │
└────────┬──────────────────────────────────┘
         │
         ├──────────────────────────────────┐
      ✅ │                                   │ ❌
         ▼                                   ▼
    Display:                            Error:
    - Nomor                             "Not found"
    - Nama Peserta
    - Bootcamp
    - Instruktur
    - Tanggal Selesai
    - Approved date
    - Manual flag
```

---

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────────────────┐
│                   LARAVEL APPLICATION                     │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │         HTTP ROUTES & CONTROLLERS                │    │
│  │  KelasOnlineController (29 methods)              │    │
│  └────────┬─────────────────────────┬───────────────┘    │
│           │                         │                    │
│    ┌──────▼──────────────┐  ┌──────▼──────────────┐     │
│    │ PESERTA ROUTES      │  │ PENYELENGGARA ROUTE│     │
│    │ (auth.peserta)      │  │ (auth)             │     │
│    │                     │  │                    │     │
│    │ • Upload presensi   │  │ • Manage presensi  │     │
│    │ • Get status        │  │ • Approve/reject   │     │
│    │ • View sertifikat   │  │ • Manage sertifikat│     │
│    │ • Check eligibility │  │ • Export CSV       │     │
│    └─────────────────────┘  └────────────────────┘     │
│           │                         │                    │
│           └──────────┬──────────────┘                    │
│                      │                                    │
│                      ▼                                    │
│    ┌─────────────────────────────────────────┐           │
│    │     SERVICE LAYER                       │           │
│    │                                         │           │
│    │  AttendanceService:                     │           │
│    │  • uploadAttendance()                   │           │
│    │  • approveAttendance()                  │           │
│    │  • rejectAttendance()                   │           │
│    │  • isAttendanceComplete()               │           │
│    │  • getAttendanceStats()                 │           │
│    │                                         │           │
│    │  CertificateService:                    │           │
│    │  • checkEligibility()                   │           │
│    │  • createCertificateIfEligible()        │           │
│    │  • approveManually()                    │           │
│    │  • getCertificateStats()                │           │
│    └────────────┬────────────────────────────┘           │
│                 │                                         │
│                 ▼                                         │
│    ┌─────────────────────────────────────────┐           │
│    │     MODEL LAYER                         │           │
│    │                                         │           │
│    │  • Attendance (belongsTo Sesi, Peserta) │           │
│    │  • Sesi (hasMany Attendances)           │           │
│    │  • Sertifikat (belongs to Peserta)      │           │
│    │  • User (hasMany Sesi via owner_id)     │           │
│    │  • Peserta (hasMany Attendance)         │           │
│    └────────────┬────────────────────────────┘           │
│                 │                                         │
│                 ▼                                         │
│    ┌─────────────────────────────────────────┐           │
│    │     DATABASE LAYER                      │           │
│    │                                         │           │
│    │  Tables:                                │           │
│    │  • attendances                          │           │
│    │  • sertifikats (updated)                │           │
│    │  • sesis (updated)                      │           │
│    │  • users, peserta, bootcamps            │           │
│    └─────────────────────────────────────────┘           │
│                                                           │
│    ┌─────────────────────────────────────────┐           │
│    │     FILE STORAGE                        │           │
│    │                                         │           │
│    │  storage/app/public/                    │           │
│    │  └── attendances/                       │           │
│    │      └── {sesi_id}/                     │           │
│    │          ├── awal/                      │           │
│    │          ├── tengah/                    │           │
│    │          └── akhir/                     │           │
│    └─────────────────────────────────────────┘           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 💾 Data Flow Diagram

```
PESERTA UPLOADS PRESENSI:
┌────────────┐        ┌──────────────┐        ┌─────────────┐
│   Form     │──POST──│  Controller  │──save──│  Database   │
│   (File)   │        │  (Validate)  │        │ (Attendance)│
└────────────┘        └──────────────┘        └─────────────┘
                             │
                             │ Check complete?
                             ▼
                      ┌──────────────┐
                      │ CertService  │
                      │ (checkElig)  │
                      └──────┬───────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                  YES                NO
                    │                 │
                    ▼                 │
            ┌─────────────────┐       │
            │ Generate CERT   │       │
            │ Save to DB      │       │
            └─────────────────┘       │
                                      ▼
                               (Stay pending)
```

---

## 🔐 Security Considerations

### 1. Authorization Checks
```php
// Peserta dapat upload untuk diri sendiri:
if ($peserta->id !== auth()->guard('peserta')->id()) {
    abort(403);
}

// Penyelenggara hanya untuk sesi mereka:
if (!$sesi->isOwnedBy(auth()->user())) {
    abort(403);
}

// Public verify tidak perlu auth
```

### 2. File Upload Security
```php
// Validate file type & size:
'file_bukti' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120'

// Store outside public root (bisa via disk 'private')
// Access via signed URL jika perlu
```

### 3. Prevent Duplicate Submission
```php
// Unique constraint di database:
UNIQUE(sesi_id, peserta_id, attendance_type)

// Update if exists (don't create duplicate)
Attendance::updateOrCreate([...], [...])
```

---

## 🎯 Best Practices Implemented

### ✅ 1. Service Layer Pattern
- Business logic di Service, bukan Controller
- Reusable untuk API & Web
- Easy to unit test

### ✅ 2. Relationship Mapping
- Eloquent relationships untuk query efficiency
- Eager load dengan `with()` untuk prevent N+1
- Scope methods untuk common queries

### ✅ 3. Data Validation
- Validate di Controller (form request pattern)
- Validate di Service jika perlu (business rule)
- Database constraints (unique, foreign key)

### ✅ 4. Audit Trail
- Track `approved_by` untuk manual approval
- Track `approved_at` untuk timestamp
- Store `approval_reason` untuk records

### ✅ 5. Soft Delete Ready
- Models bisa add `SoftDeletes` trait nanti
- Historical records terjaga

### ✅ 6. Event-Driven (Future)
- Bisa trigger `AttendanceApproved` event
- Listener untuk send email, update stats, etc.

---

## 📊 Status Lifecycle

```
ATTENDANCE STATUSES:
pending ──approve──> approved ──✓──> affects certificate
   │
   └──reject──> rejected ──resubmit──> back to pending

CERTIFICATE STATUSES:
not_eligible ──check──> eligible ──auto_create──> approved
                                          │
                         (or manual) ─────┘
                              │
                      is_manual_approved = true
                      
ELIGIBLE CONDITIONS:
✓ Attendance complete (awal + tengah + akhir)
✓ Assignment done (if required)
✓ Min score reached (if required)
```

---

## 🧪 Testing Strategy

### Unit Tests
```php
// Test AttendanceService methods
test('can upload attendance', fn() => {...})
test('can check complete', fn() => {...})
test('stats calculation', fn() => {...})

// Test CertificateService methods
test('can check eligibility', fn() => {...})
test('can create certificate', fn() => {...})
test('manual approval', fn() => {...})
```

### Feature Tests
```php
// Test full flow
test('peserta upload presensi', fn() => {...})
test('penyelenggara approve', fn() => {...})
test('certificate auto created', fn() => {...})
test('public verify', fn() => {...})
```

### API Tests
```php
// Test endpoints
test('POST /peserta/sesi/{sesi}/attendance/upload', fn() => {...})
test('GET /kelas-online/sesi/{sesi}/attendance/manage', fn() => {...})
test('POST /kelas-online/attendance/{id}/approve', fn() => {...})
```

---

## 📈 Performance Optimization

### Queries to Optimize (use `select()`)
```php
// Instead of select *
Attendance::where(...)->select(['id', 'status', 'peserta_id'])->get()

// Eager load relationships
Attendance::with(['peserta', 'sesi'])->get()

// Index pada frequently queried columns
- sesi_id
- peserta_id
- status
- attendance_type
```

### Caching Candidates
```php
// Cache attendance stats (update when record changes)
Cache::remember("attendance_stats_{$sesi->id}", 3600, fn() => {...})

// Cache eligibility check (cache per peserta per bootcamp)
Cache::remember("cert_eligible_{$bootcamp->id}_{$peserta->id}", 600, fn() => {...})
```

---

**Architecture Version**: 1.0
**Last Updated**: 2026-04-22
