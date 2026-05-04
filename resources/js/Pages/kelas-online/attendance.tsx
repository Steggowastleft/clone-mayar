import { useState, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";

interface Sesi {
  id: number;
  tipe: "awal" | "tengah" | "akhir";
  judul: string;
  is_aktif: boolean;
  dibuka_pada: string | null;
  ditutup_pada: string | null;
  batas_waktu: string | null;
}

interface AttendanceRecord {
  status: "pending" | "approved" | "rejected";
  uploaded_at: string;
  keterangan: string | null;
  is_late: boolean;
}

interface AttendanceSummary {
  awal:        AttendanceRecord | null;
  tengah:      AttendanceRecord | null;
  akhir:       AttendanceRecord | null;
  is_complete: boolean;
  sesi: {
    awal:   Sesi | null;
    tengah: Sesi | null;
    akhir:  Sesi | null;
  };
}

interface Props {
  sesi:       Sesi;
  kelas:      { id: number; nama: string };
  attendance: AttendanceSummary;
}

// ================================================================
const SESI_CFG = {
  awal:   { icon: "🌅", label: "Presensi Awal",   color: "from-emerald-500 to-teal-500",   border: "border-emerald-200", bg: "bg-emerald-50",  badge: "bg-emerald-100 text-emerald-700" },
  tengah: { icon: "☀️",  label: "Presensi Tengah", color: "from-amber-500 to-orange-500",   border: "border-amber-200",  bg: "bg-amber-50",   badge: "bg-amber-100 text-amber-700" },
  akhir:  { icon: "🌙", label: "Presensi Akhir",  color: "from-violet-500 to-purple-500",  border: "border-violet-200", bg: "bg-violet-50",  badge: "bg-violet-100 text-violet-700" },
};

// ================================================================
// MODAL UPLOAD
// ================================================================
function UploadModal({
  tipe, sesiId, kelasId, onClose, onSuccess,
}: {
  tipe: "awal" | "tengah" | "akhir";
  sesiId: number;
  kelasId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile]       = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const cfg = SESI_CFG[tipe];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Maks. 5MB."); return; }
    setFile(f); setError(null);
    if (f.type.startsWith("image/")) {
      const r = new FileReader();
      r.onload = (ev) => setPreview(ev.target?.result as string);
      r.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) { setError("Pilih file terlebih dahulu."); return; }
    setLoading(true); setError(null);
    const fd = new FormData();
    fd.append("attendance_type", tipe);
    fd.append("file_bukti", file);
    try {
      await axios.post(`/peserta/sesi/${sesiId}/attendance/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Gagal upload. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className={`bg-gradient-to-r ${cfg.color} p-5 text-white`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{cfg.icon} {cfg.label}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">✕</button>
          </div>
          <p className="text-white/75 text-xs mt-1">Upload screenshot atau foto sebagai bukti kehadiran</p>
        </div>

        <div className="p-5 space-y-4">
          <label className="block cursor-pointer">
            <div className={`border-2 border-dashed ${cfg.border} rounded-xl p-6 text-center hover:${cfg.bg} transition-colors`}>
              {preview
                ? <img src={preview} className="max-h-48 mx-auto rounded-lg object-cover" />
                : file
                  ? <div className="text-slate-500"><div className="text-3xl mb-2">📄</div><p className="font-medium text-sm">{file.name}</p></div>
                  : <div className="text-slate-400"><div className="text-4xl mb-2">📸</div><p className="font-medium text-sm text-slate-600">Klik untuk pilih file</p><p className="text-xs mt-1">JPG, PNG, PDF — Maks. 5MB</p></div>
              }
            </div>
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
          </label>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50">Batal</button>
            <button
              onClick={handleSubmit} disabled={loading || !file}
              className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all
                ${loading || !file ? "bg-gray-300 cursor-not-allowed" : `bg-gradient-to-r ${cfg.color} hover:opacity-90 shadow-md`}`}
            >
              {loading ? "Mengirim..." : "Kirim Presensi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// ATTENDANCE CARD
// ================================================================
function AttendanceCard({
  tipe, sesiInfo, record, sesiId, kelasId, onRefresh,
}: {
  tipe: "awal" | "tengah" | "akhir";
  sesiInfo: Sesi | null;
  record: AttendanceRecord | null;
  sesiId: number;
  kelasId: number;
  onRefresh: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const cfg = SESI_CFG[tipe];

  const isDone    = record?.status === "approved";
  const isPending = record?.status === "pending";
  const isRejected= record?.status === "rejected";
  const isOpen    = sesiInfo?.is_aktif ?? false;

  return (
    <>
      <div className={`relative rounded-2xl border-2 overflow-hidden
        ${isDone ? `${cfg.border} ${cfg.bg}` : isOpen ? "border-gray-200 bg-white shadow-lg" : "border-gray-100 bg-gray-50"}`}>
        <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.color}`} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-2xl">{cfg.icon}</span>
              <h3 className="font-bold text-gray-800 mt-1 text-sm">{cfg.label}</h3>
            </div>
            {isDone && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>✓ Hadir</span>}
            {isPending && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">⏳ Review</span>}
            {isRejected && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">✗ Ditolak</span>}
            {!record && isOpen && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 animate-pulse">🔴 Live</span>}
            {!record && !isOpen && <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">Belum Dibuka</span>}
          </div>

          {isOpen && sesiInfo?.batas_waktu && (
            <div className="mb-3 p-2 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Batas Waktu</p>
                    <p className="text-xs font-black text-indigo-700">
                        {new Date(sesiInfo.batas_waktu).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-lg">⏳</div>
            </div>
          )}

          {record && (
            <p className="text-xs text-gray-400 mb-3">
              Dikirim: {new Date(record.uploaded_at).toLocaleString("id-ID")}
            </p>
          )}

          {isRejected && record?.keterangan && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{record.keterangan}</p>
          )}

          {!isDone && !isPending && isOpen ? (
            <button
              onClick={() => setShowModal(true)}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${cfg.color} hover:opacity-90 shadow-md`}
            >
              Upload Bukti Presensi
            </button>
          ) : isDone ? (
            <div className={`w-full py-2 rounded-xl text-center text-sm font-semibold ${cfg.badge}`}>✓ Presensi Tercatat</div>
          ) : isPending ? (
            <div className="w-full py-2 rounded-xl text-center text-sm text-amber-700 bg-amber-50">Menunggu konfirmasi...</div>
          ) : !isOpen && !record ? (
            <div className="w-full py-2 rounded-xl text-center text-sm text-gray-400 bg-gray-100">Sesi belum dibuka</div>
          ) : isRejected ? (
            <button
              onClick={() => setShowModal(true)}
              className={`w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${cfg.color} hover:opacity-90`}
            >
              Upload Ulang
            </button>
          ) : null}
        </div>
      </div>

      {showModal && (
        <UploadModal
          tipe={tipe} sesiId={sesiId} kelasId={kelasId}
          onClose={() => setShowModal(false)} onSuccess={onRefresh}
        />
      )}
    </>
  );
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function AttendancePage({ sesi, kelas, attendance: initialAttendance }: Props) {
  const [attendance, setAttendance] = useState(initialAttendance);

  // Auto-reload status every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        router.reload({ 
            only: ['attendance'], 
            preserveScroll: true,
            onSuccess: (page) => {
                setAttendance(page.props.attendance as any);
            }
        });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const refreshStatus = async () => {
    try {
      const { data } = await axios.get(`/peserta/sesi/${sesi.id}/attendance/status`);
      setAttendance((prev) => ({
        ...prev,
        awal:        data.attendance.awal   ? { ...prev.awal,   status: data.attendance.awal.status }   : prev.awal,
        tengah:      data.attendance.tengah ? { ...prev.tengah, status: data.attendance.tengah.status } : prev.tengah,
        akhir:       data.attendance.akhir  ? { ...prev.akhir,  status: data.attendance.akhir.status }  : prev.akhir,
        is_complete: data.complete,
      }));
    } catch (_) {}
  };

  const completedCount = [attendance.awal, attendance.tengah, attendance.akhir]
    .filter((a) => a?.status === "approved").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-widest">Kelas Online</p>
          <h1 className="text-xl font-black text-gray-900 mt-0.5">{kelas.nama}</h1>

          {/* Progress bar */}
          <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">Progres Presensi</span>
              <span className="font-bold text-gray-700">{completedCount}/3</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-all duration-500
                    ${i < completedCount ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gray-100"}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {completedCount === 3 ? "✨ Presensi Anda lengkap!" : `${3 - completedCount} presensi lagi`}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3 mb-6">
          {(["awal", "tengah", "akhir"] as const).map((tipe) => (
            <AttendanceCard
              key={tipe}
              tipe={tipe}
              sesiInfo={attendance.sesi[tipe]}
              record={attendance[tipe]}
              sesiId={attendance.sesi[tipe]?.id ?? sesi.id}
              kelasId={kelas.id}
              onRefresh={refreshStatus}
            />
          ))}
        </div>

        {/* Sertifikat Banner */}
        {attendance.is_complete ? (
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-bold text-emerald-700">Presensi Lengkap!</p>
            <p className="text-sm text-emerald-600 mt-1">Sertifikat Anda sedang diproses.</p>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
            <p className="font-semibold mb-0.5">Belum bisa dapat sertifikat?</p>
            <p className="text-xs text-amber-600">Hubungi penyelenggara kelas jika ada kendala presensi.</p>
          </div>
        )}
      </div>
    </div>
  );
}