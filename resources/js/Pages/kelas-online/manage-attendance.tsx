import { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import axios from "axios";

interface Peserta { id: number; nama: string; email: string; }
interface AttendanceItem {
  id: number;
  peserta: Peserta;
  attendance_type: "awal" | "tengah" | "akhir";
  status: "pending" | "approved" | "rejected";
  uploaded_at: string;
  keterangan: string | null;
  file_nama_asli: string;
  is_late: boolean;
}
interface Sesi { id: number; tipe: string; judul: string; is_aktif: boolean; batas_waktu: string | null; }
interface KelasOnline { id: number; nama: string; }
interface Props {
  sesi: Sesi;
  kelas: KelasOnline;
  attendances: { data: AttendanceItem[]; total: number };
  stats: { total_peserta: number; total_approved: number; total_pending: number; per_tipe: Record<string, number> };
}

const TIPE_CFG = {
  awal:   { label: "Awal",   icon: "🌅", cls: "bg-emerald-100 text-emerald-700" },
  tengah: { label: "Tengah", icon: "☀️",  cls: "bg-amber-100 text-amber-700" },
  akhir:  { label: "Akhir",  icon: "🌙", cls: "bg-violet-100 text-violet-700" },
};

const STATUS_CFG = {
  pending:  { label: "Pending",  cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Approved", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Ditolak",  cls: "bg-red-100 text-red-700" },
};

function AttendanceRow({
  item,
  onApprove,
  onReject,
}: {
  item: AttendanceItem;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const tipe   = TIPE_CFG[item.attendance_type];
  const status = STATUS_CFG[item.status];

  const handleApprove = async () => {
    setLoading(true);
    try {
      await axios.post(`/kelas-online/attendance/${item.id}/approve`);
      onApprove(item.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await axios.post(`/kelas-online/attendance/${item.id}/reject`, { keterangan: rejectNote });
      onReject(item.id);
      setShowRejectInput(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50">
      {/* Peserta */}
      <td className="px-4 py-3">
        <p className="font-semibold text-gray-800 text-sm">{item.peserta.nama}</p>
        <p className="text-xs text-gray-400">{item.peserta.email}</p>
      </td>

      {/* Tipe */}
      <td className="px-3 py-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tipe.cls}`}>
          {tipe.icon} {tipe.label}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <div className="flex flex-col gap-1 items-start">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
            {status.label}
            </span>
            {item.is_late && (
                <span className="text-[9px] font-black bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-tighter">
                    ⚠️ Terlambat
                </span>
            )}
        </div>
      </td>

      {/* File */}
      <td className="px-3 py-3">
        <a
          href={`/kelas-online/attendance/${item.id}/bukti`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline"
        >
          📎 {item.file_nama_asli}
        </a>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(item.uploaded_at).toLocaleString("id-ID")}
        </p>
      </td>

      {/* Aksi */}
      <td className="px-4 py-3 text-right">
        {item.status === "pending" && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "..." : "✓ Setujui"}
            </button>
            {!showRejectInput ? (
              <button
                onClick={() => setShowRejectInput(true)}
                className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200"
              >
                ✗ Tolak
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Alasan tolak..."
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-36 focus:outline-none"
                />
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  Kirim
                </button>
                <button onClick={() => setShowRejectInput(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              </div>
            )}
          </div>
        )}
        {item.status === "approved" && <span className="text-xs text-emerald-600">✓ Disetujui</span>}
        {item.status === "rejected" && (
          <div className="text-right">
            <span className="text-xs text-red-600">✗ Ditolak</span>
            {item.keterangan && <p className="text-xs text-gray-400 mt-0.5">{item.keterangan}</p>}
          </div>
        )}
      </td>
    </tr>
  );
}

export default function ManageAttendance({ sesi, kelas, attendances: initialAttendances, stats }: Props) {
  const [attendances, setAttendances] = useState(initialAttendances.data);
  const [sesiAktif, setSesiAktif]     = useState(sesi.is_aktif);
  const [toggling, setToggling]       = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentSesi, setCurrentSesi] = useState<Sesi>(sesi);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ 
        preserveScroll: true,
        onSuccess: (page) => {
            setAttendances((page.props.attendances as any).data);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (id: number) => {
    setAttendances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
    );
  };

  const handleReject = (id: number) => {
    setAttendances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
    );
  };

  const toggleSesi = async () => {
    if (!sesiAktif && (!selectedDate || !selectedTime)) {
      setShowTimeModal(true);
      return;
    }

    setToggling(true);
    try {
      const combinedDateTime = `${selectedDate} ${selectedTime}`;
      const { data } = await axios.patch(`/kelas-online/${kelas.id}/sesi/${sesi.tipe}/toggle`, {
        batas_waktu: combinedDateTime
      });
      setSesiAktif(data.sesi.is_aktif);
      setCurrentSesi(data.sesi);
      setShowTimeModal(false);
    } finally {
      setToggling(false);
    }
  };

  const pending  = attendances.filter((a) => a.status === "pending").length;
  const approved = attendances.filter((a) => a.status === "approved").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href={`/kelas-online/${kelas.id}/manage`} className="text-xs text-gray-400 hover:text-gray-600">
              ← Kembali ke kelas
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Kelola Presensi — {sesi.judul}
            </h1>
            <p className="text-sm text-gray-500">{kelas.nama}</p>
          </div>

          {/* Toggle Sesi */}
          <button
            onClick={toggleSesi}
            disabled={toggling}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${toggling ? "opacity-50 cursor-wait" :
                sesiAktif
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"}`}
          >
            {toggling ? "..." : sesiAktif ? "🔴 Tutup Sesi" : "🟢 Buka Sesi"}
          </button>
        </div>

        {/* Modal Pilih Batas Waktu */}
        {showTimeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Atur Batas Waktu</h3>
              <p className="text-sm text-gray-500 mb-4">Tentukan sampai kapan peserta diperbolehkan melakukan presensi.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tanggal</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jam</label>
                    <input 
                      type="time" 
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-400 italic">
                  * Toleransi keterlambatan adalah 10 menit setelah batas waktu ini.
                </p>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setShowTimeModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={toggleSesi}
                    disabled={!selectedDate || !selectedTime || toggling}
                    className="flex-1 px-4 py-2 text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200 disabled:opacity-50 transition-all"
                  >
                    {toggling ? "..." : "Buka Sesi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Sesi */}
        {sesiAktif && currentSesi.batas_waktu && (
          <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl">⏳</div>
              <div>
                <p className="text-sm font-bold text-indigo-900">Sesi Sedang Berlangsung</p>
                <p className="text-xs text-indigo-600">
                  Batas Waktu: {new Date(currentSesi.batas_waktu).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">STATUS</p>
              <p className="text-xs font-black text-indigo-600">AKTIF</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Upload", value: attendances.length, icon: "📤", color: "text-gray-700" },
            { label: "Approved",     value: approved,           icon: "✅", color: "text-emerald-700" },
            { label: "Menunggu",     value: pending,            icon: "⏳", color: "text-amber-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xl">{s.icon}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Export */}
        <div className="flex justify-end mb-4">
          <a
            href={`/kelas-online/attendance/${sesi.id}/export`}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            ⬇ Export CSV
          </a>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Peserta</th>
                <th className="px-3 py-3 text-left">Sesi</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">File Bukti</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Belum ada presensi yang diupload.
                  </td>
                </tr>
              ) : (
                attendances.map((item) => (
                  <AttendanceRow
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}