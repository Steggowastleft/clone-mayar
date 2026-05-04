# 📋 Dokumentasi Fitur Kelas Online - Presensi & Sertifikat

## 📌 Overview

Sistem kelas online dengan fitur:
- **Presensi 3 tahap** (awal, tengah, akhir) dengan upload bukti
- **Validasi Sertifikat** otomatis berdasarkan kelengkapan presensi
- **Approval Manual** oleh penyelenggara kelas untuk kasus khusus
- **Role System** dengan Peserta dan Penyelenggara Kelas

---

## 🗄️ Database Structure

### 1. **Attendances Table**
Menyimpan data presensi peserta per sesi.

```sql
CREATE TABLE attendances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sesi_id BIGINT NOT NULL (FK: sesis.id),
    peserta_id BIGINT NOT NULL (FK: peserta.id),
    attendance_type ENUM('awal', 'tengah', 'akhir'),
    file_bukti VARCHAR(255) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    keterangan TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(sesi_id, peserta_id, attendance_type),
    INDEX(sesi_id, peserta_id)
);
```

### 2. **Sertifikats Table Updates**
Tambahan kolom untuk mengelola approval manual.

```sql
ALTER TABLE sertifikats ADD COLUMN (
    is_approved BOOLEAN DEFAULT false,
    is_manual_approved BOOLEAN DEFAULT false,
    approved_by BIGINT NULL (FK: users.id),
    approved_at TIMESTAMP NULL,
    approval_reason TEXT NULL
);
```

### 3. **Sesis Table Updates**
Tambahan kolom untuk konfigurasi sesi dan owner.

```sql
ALTER TABLE sesis ADD COLUMN (
    owner_id BIGINT NULL (FK: users.id),
    require_attendance BOOLEAN DEFAULT true,
    has_assignment BOOLEAN DEFAULT false,
    assignment_required_for_cert BOOLEAN DEFAULT false,
    min_assignment_score INT DEFAULT 0
);
```

---

## 🔄 Flow Sistem

### Peserta: Upload Presensi

```
1. Peserta masuk ke sesi kelas → Lihat status presensi
2. Klik "Upload Bukti" → Upload file (awal/tengah/akhir)
3. File tersimpan → Status: "pending"
4. Penyelenggara approve → Status: "approved"
5. Jika 3 presensi sudah "approved" → Otomatis generate sertifikat
```

### Penyelenggara: Manage Presensi

```
1. Buka halaman "Manage Presensi" untuk sesi
2. Lihat daftar submission presensi peserta
3. Validate & Approve atau Reject
4. Approved presensi berkontribusi ke sertifikat
```

### Penyelenggara: Manage Sertifikat

```
1. Buka halaman "Manage Sertifikat" untuk bootcamp
2. Lihat status: "approved", "pending", "rejected"
3. Jika ada yang pending:
   - Check alasan (presensi kurang, dll)
   - Approve manual (jika ada alasan khusus)
4. Export sebagai CSV untuk records
```

### Sistem: Auto-Generate Sertifikat

```
1. Setiap kali presensi di-approve:
   - Check: apakah 3 presensi (awal/tengah/akhir) sudah complete?
   - Check: apakah assignment (jika required) sudah done?
   - Jika YES → Generate sertifikat otomatis
   - Jika NO → Keep status pending
```

---

## 🔌 API Endpoints

### **PESERTA ENDPOINTS**

#### 1️⃣ Get Presensi Status
```http
GET /peserta/sesi/{sesi_id}/attendance/status
Authorization: Bearer {peserta_token}

Response:
{
    "complete": true|false,
    "attendance": {
        "awal": {"status": "approved|pending|rejected"},
        "tengah": {"status": "approved|pending|rejected"},
        "akhir": {"status": "approved|pending|rejected"}
    }
}
```

#### 2️⃣ Upload Presensi
```http
POST /peserta/sesi/{sesi_id}/attendance/upload
Authorization: Bearer {peserta_token}
Content-Type: multipart/form-data

Body:
{
    "attendance_type": "awal|tengah|akhir",
    "file_bukti": <file>
}

Response:
{
    "success": true,
    "message": "Presensi berhasil diupload",
    "attendance": {
        "id": 1,
        "sesi_id": 1,
        "peserta_id": 1,
        "attendance_type": "awal",
        "file_bukti": "attendances/1/awal/file.jpg",
        "status": "pending"
    }
}
```

#### 3️⃣ Check Sertifikat Status
```http
GET /peserta/bootcamp/{bootcamp_id}/sertifikat/check
Authorization: Bearer {peserta_token}

Response:
{
    "eligible": true|false,
    "reason": "Memenuhi semua syarat|Belum memenuhi syarat",
    "missing": [
        "Presensi belum lengkap di sesi: Intro",
        "Nilai assignment di sesi Intro belum memenuhi minimum (70)"
    ],
    "certificate": {
        "nomor": "CERT-2026-ABC123",
        "is_approved": true,
        "tanggal_selesai": "2026-04-22",
        "url": "http://app.test/sertifikat/verify/token123"
    }
}
```

#### 4️⃣ Get Sertifikat Peserta
```http
GET /peserta/sertifikat
Authorization: Bearer {peserta_token}

Response:
[
    {
        "id": 1,
        "nomor_sertifikat": "CERT-2026-ABC123",
        "bootcamp": {
            "id": 1,
            "nama": "Laravel Bootcamp"
        },
        "tanggal_selesai": "2026-04-22",
        "url": "http://app.test/sertifikat/verify/token123"
    }
]
```

---

### **PENYELENGGARA ENDPOINTS**

#### 1️⃣ Get Presensi Management
```http
GET /kelas-online/sesi/{sesi_id}/attendance/manage
Authorization: Bearer {user_token}

Response:
{
    "sesi": { /* sesi data */ },
    "attendances": {
        "data": [
            {
                "id": 1,
                "peserta": {"id": 1, "nama": "Budi"},
                "attendance_type": "awal",
                "status": "pending",
                "file_bukti": "attendances/1/awal/file.jpg",
                "created_at": "2026-04-22T10:00:00"
            }
        ],
        "pagination": { /* ... */ }
    },
    "stats": {
        "total_peserta": 30,
        "peserta_pending": 5,
        "peserta_complete": 20,
        "percentage_complete": 66.67
    }
}
```

#### 2️⃣ Approve Presensi
```http
POST /kelas-online/attendance/{attendance_id}/approve
Authorization: Bearer {user_token}

Response:
{
    "success": true,
    "message": "Presensi berhasil disetujui",
    "attendance": {
        "id": 1,
        "status": "approved",
        "peserta": {"id": 1, "nama": "Budi"}
    }
}
```

#### 3️⃣ Reject Presensi
```http
POST /kelas-online/attendance/{attendance_id}/reject
Authorization: Bearer {user_token}
Content-Type: application/json

Body:
{
    "keterangan": "Bukti tidak jelas"
}

Response:
{
    "success": true,
    "message": "Presensi ditolak",
    "attendance": {
        "id": 1,
        "status": "rejected",
        "keterangan": "Bukti tidak jelas"
    }
}
```

#### 4️⃣ Export Presensi ke CSV
```http
GET /kelas-online/attendance/{sesi_id}/export
Authorization: Bearer {user_token}

Response: (CSV file)
Peserta,Tipe Presensi,Status,Tanggal Upload
Budi,awal,approved,2026-04-22 10:00:00
Budi,tengah,pending,2026-04-22 11:00:00
Anda,awal,approved,2026-04-22 10:05:00
```

#### 5️⃣ Get Sertifikat Management
```http
GET /kelas-online/bootcamp/{bootcamp_id}/sertifikat/manage
Authorization: Bearer {user_token}

Response:
{
    "bootcamp": { /* bootcamp data */ },
    "certificates": {
        "data": [
            {
                "id": 1,
                "peserta": {"id": 1, "nama": "Budi"},
                "nomor_sertifikat": "CERT-2026-ABC123",
                "is_approved": true,
                "is_manual_approved": false,
                "approved_at": "2026-04-22",
                "approvedBy": null
            }
        ],
        "pagination": { /* ... */ }
    },
    "stats": {
        "total_peserta": 30,
        "approved": 25,
        "pending": 5,
        "manual_approved": 2,
        "approval_rate": 83.33
    }
}
```

#### 6️⃣ Manual Approve Sertifikat
```http
POST /kelas-online/sertifikat/{certificate_id}/approve-manual
Authorization: Bearer {user_token}
Content-Type: application/json

Body:
{
    "reason": "Peserta hadir di kelas tapi lupa upload bukti"
}

Response:
{
    "success": true,
    "message": "Sertifikat berhasil disetujui",
    "certificate": {
        "id": 1,
        "is_approved": true,
        "is_manual_approved": true,
        "approved_by": 1,
        "approved_at": "2026-04-22T14:30:00",
        "approval_reason": "Peserta hadir di kelas tapi lupa upload bukti"
    }
}
```

#### 7️⃣ Get Pending Certificates
```http
GET /kelas-online/sertifikat/pending
Authorization: Bearer {user_token}

Response:
{
    "pending_count": 5,
    "certificates": [
        {
            "id": 1,
            "peserta": "Budi",
            "bootcamp": "Laravel Bootcamp",
            "status": "pending"
        }
    ]
}
```

#### 8️⃣ Export Sertifikat ke CSV
```http
GET /kelas-online/{bootcamp_id}/sertifikat/export
Authorization: Bearer {user_token}

Response: (CSV file)
Nomor Sertifikat,Nama Peserta,Tanggal Selesai,Status,Diapprove Oleh
CERT-2026-ABC123,Budi,2026-04-22,Otomatis,Sistem
CERT-2026-DEF456,Anda,2026-04-23,Manual,Admin
```

---

### **PUBLIC ENDPOINTS**

#### 1️⃣ Verify Sertifikat (Public)
```http
GET /kelas-online/sertifikat/verify/{qr_token}

Response:
{
    "valid": true,
    "nomor": "CERT-2026-ABC123",
    "nama_peserta": "Budi",
    "nama_bootcamp": "Laravel Bootcamp",
    "nama_instruktur": "Reza Pratama",
    "tanggal_selesai": "2026-04-22",
    "approved_at": "2026-04-22",
    "is_manual_approved": false
}
```

---

## 📦 Model Relationships

### Attendance
```php
class Attendance extends Model {
    public function sesi(): BelongsTo { /* ... */ }
    public function peserta(): BelongsTo { /* ... */ }
}
```

### Sesi
```php
class Sesi extends Model {
    public function bootcamp(): BelongsTo { /* ... */ }
    public function owner(): BelongsTo { /* User */ }
    public function attendances(): HasMany { /* ... */ }
    public function attendancesAwal() { /* filtered */ }
    public function attendancesTengah() { /* filtered */ }
    public function attendancesAkhir() { /* filtered */ }
    public function isOwnedBy(User $user): bool { /* ... */ }
}
```

### Sertifikat
```php
class Sertifikat extends Model {
    public function peserta(): BelongsTo { /* ... */ }
    public function bootcamp(): BelongsTo { /* ... */ }
    public function approvedBy(): BelongsTo { /* User */ }
}
```

---

## 🎯 Service Classes

### AttendanceService
```php
class AttendanceService {
    public function uploadAttendance(Sesi $sesi, Peserta $peserta, string $type, $file): Attendance
    public function approveAttendance(Attendance $attendance): void
    public function rejectAttendance(Attendance $attendance, string $keterangan): void
    public function isAttendanceComplete(Sesi $sesi, Peserta $peserta): bool
    public function getAttendanceSummary(Sesi $sesi, Peserta $peserta): array
    public function getAttendanceStats(Sesi $sesi): array
}
```

### CertificateService
```php
class CertificateService {
    public function checkEligibility(Bootcamp $bootcamp, Peserta $peserta): array
    public function createCertificateIfEligible(Bootcamp $bootcamp, Peserta $peserta): ?Sertifikat
    public function approveManually(Sertifikat $sertifikat, User $approver, string $reason): void
    public function reject(Sertifikat $sertifikat, string $reason): void
    public function getPendingCertificates(User $owner)
    public function getCertificateStats(Bootcamp $bootcamp): array
}
```

---

## 🚀 Contoh Implementasi Frontend (React/TypeScript)

### 1. Upload Presensi Component

```typescript
import React, { useState } from 'react';
import axios from 'axios';

export default function AttendanceUpload({ sesiId }: { sesiId: number }) {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<'awal' | 'tengah' | 'akhir'>('awal');
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file_bukti', file);
        formData.append('attendance_type', type);

        try {
            const response = await axios.post(
                `/peserta/sesi/${sesiId}/attendance/upload`,
                formData
            );
            alert(response.data.message);
            setFile(null);
        } catch (error) {
            alert('Upload gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpload}>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="awal">Presensi Awal</option>
                <option value="tengah">Presensi Tengah</option>
                <option value="akhir">Presensi Akhir</option>
            </select>
            <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Bukti'}
            </button>
        </form>
    );
}
```

### 2. Presensi Status Component

```typescript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AttendanceStatus {
    complete: boolean;
    attendance: {
        awal: { status: string } | null;
        tengah: { status: string } | null;
        akhir: { status: string } | null;
    };
}

export default function AttendanceStatus({ sesiId }: { sesiId: number }) {
    const [status, setStatus] = useState<AttendanceStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axios.get(`/peserta/sesi/${sesiId}/attendance/status`);
                setStatus(response.data);
            } catch (error) {
                console.error('Failed to fetch status', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [sesiId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h3>Status Presensi</h3>
            <div>
                <p>
                    Presensi Awal: 
                    <span className={status?.attendance.awal?.status || 'not-submitted'}>
                        {status?.attendance.awal?.status || 'Belum diupload'}
                    </span>
                </p>
                <p>
                    Presensi Tengah: 
                    <span className={status?.attendance.tengah?.status || 'not-submitted'}>
                        {status?.attendance.tengah?.status || 'Belum diupload'}
                    </span>
                </p>
                <p>
                    Presensi Akhir: 
                    <span className={status?.attendance.akhir?.status || 'not-submitted'}>
                        {status?.attendance.akhir?.status || 'Belum diupload'}
                    </span>
                </p>
            </div>
            {status?.complete && (
                <div style={{color: 'green'}}>
                    ✓ Presensi Anda lengkap! Sertifikat akan segera diterbitkan.
                </div>
            )}
        </div>
    );
}
```

---

## ✅ Checklist Implementasi

- [x] Migration untuk Attendances table
- [x] Update migration untuk Sertifikats (approval fields)
- [x] Update migration untuk Sesis (owner & config fields)
- [x] Model Attendance dengan relationships & methods
- [x] Update Model Sesi dengan relationships & helpers
- [x] Update Model Sertifikat dengan relationships
- [x] AttendanceService untuk logic upload & validation
- [x] CertificateService untuk logic sertifikat
- [x] KelasOnlineController dengan semua endpoints
- [x] Routes untuk peserta & penyelenggara
- [x] Public routes untuk verifikasi sertifikat

---

## 🔍 Testing Examples

### Test Upload Presensi
```bash
curl -X POST http://app.test/peserta/sesi/1/attendance/upload \
  -H "Authorization: Bearer token" \
  -F "attendance_type=awal" \
  -F "file_bukti=@screenshot.jpg"
```

### Test Get Status
```bash
curl -X GET http://app.test/peserta/sesi/1/attendance/status \
  -H "Authorization: Bearer token"
```

### Test Manage Presensi
```bash
curl -X GET http://app.test/kelas-online/sesi/1/attendance/manage \
  -H "Authorization: Bearer token"
```

### Test Approve Presensi
```bash
curl -X POST http://app.test/kelas-online/attendance/1/approve \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 📋 Notes

1. **File Storage**: Presensi file tersimpan di `storage/app/public/attendances/{sesi_id}/{type}/`
2. **Auto Certificate**: Sertifikat otomatis digenerate ketika semua presensi approved
3. **QR Token**: Untuk verifikasi sertifikat, gunakan format `/kelas-online/sertifikat/verify/{qr_token}`
4. **Ownership Check**: Hanya penyelenggara (owner) sesi yang bisa manage presensi
5. **Assignment Score**: Optional, tergantung konfigurasi sesi

---

**Status**: ✅ Ready for development
