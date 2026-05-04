import { useState } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";

interface Peserta   { id: number; nama: string; email: string; }
interface ApprovedBy { id: number; name: string; }
interface CertItem {
  id: number;
  peserta: Peserta;
  status: "not_eligible" | "pending" | "approved" | "manual_approved" | "rejected";
  nomor_sertifikat: string | null;
  is_manual_approved: boolean;
  approved_at: string | null;
  approved_by: ApprovedBy | null;
  catatan_approval: string | null;
}
interface Stats {
  total: number; approved: number; manual_approved: number;
  pending: number; not_eligible: number;
}
interface Props {
  kelas: { id: number; nama: string };
  certificates: { data: CertItem[]; total: number };
  stats: Stats;
}

// ================================================================
const STATUS_CFG = {
  approved:        { label: "Otomatis ✓",    cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  manual_approved: { label: "Manual ✓",      cls: "bg-blue-100 text-blue-700",      dot: "bg-blue-500" },
  pending:         { label: "Pending",        cls: "bg-amber-100 text-amber-700",    dot: "bg-amber-400" },
  not_eligible:    { label: "Tidak Eligible", cls: "bg-gray-100 text-gray-500",      dot: "bg-gray-300" },
  rejected:        { label: "Ditolak",        cls: "bg-red-100 text-red-700",        dot: "bg-red-500" },
};

// ================================================================
// MODAL APPROVE MANUAL
// ================================================================
function ApproveModal({
  cert, kelasId, onClose, onSuccess,
}: {
  cert: CertItem;
  kelasId: number;
  onClose: () => void;
  onSuccess: (id: number, nomor: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await axios.post(
        `/kelas-online/sertifikat/${cert.id}/approve-manual`,
        { reason }
      );
      onSuccess(cert.id, data.certificate?.nomor_sertifikat);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Gagal approve. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">✅ Manual Approval Sertifikat</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✕</button>
          </div>
          <p className="text-blue-100 text-sm mt-1">untuk {cert.peserta.nama}</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-sm">
            <p className="font-semibold text-gray-700 mb-1">Peserta</p>
            <p className="text-gray-600">{cert.peserta.nama}</p>
            <p className="text-gray-400 text-xs">{cert.peserta.email}</p>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CFG[cert.status].cls}`}>
                Status saat ini: {STATUS_CFG[cert.status].label}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan / Catatan Approval
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Peserta mengalami kendala teknis saat presensi..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50">Batal</button>
            <button
              onClick={handleApprove} disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Setujui Sertifikat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// CERTIFICATE ROW
// ================================================================
function CertRow({
  cert, kelasId, onApprove,
}: {
  cert: CertItem;
  kelasId: number;
  onApprove: (id: number, nomor: string) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const cfg = STATUS_CFG[cert.status];
  const canApprove = !["approved", "manual_approved"].includes(cert.status);

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/50">
        <td className="px-4 py-3">
          <p className="font-semibold text-gray-800 text-sm">{cert.peserta.nama}</p>
          <p className="text-xs text-gray-400">{cert.peserta.email}</p>
        </td>

        <td className="px-3 py-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </td>

        <td className="px-3 py-3">
          {cert.nomor_sertifikat
            ? <span className="text-xs font-mono text-gray-600">{cert.nomor_sertifikat}</span>
            : <span className="text-xs text-gray-300">—</span>
          }
        </td>

        <td className="px-3 py-3 text-xs text-gray-500">
          {cert.approved_at
            ? new Date(cert.approved_at).toLocaleDateString("id-ID")
            : "—"
          }
          {cert.is_manual_approved && cert.approved_by && (
            <p className="text-gray-400 text-xs">{cert.approved_by.name}</p>
          )}
        </td>

        <td className="px-4 py-3 text-right">
          {canApprove && (
            <button
              onClick={() => setShowModal(true)}
              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Approve Manual
            </button>
          )}
        </td>
      </tr>

      {showModal && (
        <ApproveModal
          cert={cert} kelasId={kelasId}
          onClose={() => setShowModal(false)}
          onSuccess={onApprove}
        />
      )}
    </>
  );
}

// ================================================================
// MAIN PAGE
// ================================================================
export default function ManageCertificates({ kelas, certificates: initialCerts, stats: initialStats }: Props) {
  const [certs, setCerts] = useState(initialCerts.data);
  const [stats, setStats] = useState(initialStats);

  const handleApprove = (id: number, nomor: string) => {
    setCerts((prev) =>
      prev.map((c) => c.id === id
        ? { ...c, status: "manual_approved" as const, nomor_sertifikat: nomor, is_manual_approved: true }
        : c
      )
    );
    setStats((prev) => ({
      ...prev,
      manual_approved: prev.manual_approved + 1,
      pending: Math.max(0, prev.pending - 1),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href={`/kelas-online/${kelas.id}/manage`} className="text-xs text-gray-400 hover:text-gray-600">
              ← Kembali ke kelas
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-1">Kelola Sertifikat</h1>
            <p className="text-sm text-gray-500">{kelas.nama}</p>
          </div>
          <a
            href={`/kelas-online/sertifikat/export/${kelas.id}`}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            ⬇ Export CSV
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total",     value: stats.total,           color: "text-gray-700" },
            { label: "Otomatis",  value: stats.approved,        color: "text-emerald-700" },
            { label: "Manual",    value: stats.manual_approved, color: "text-blue-700" },
            { label: "Pending",   value: stats.pending,         color: "text-amber-700" },
            { label: "Tidak Eligible", value: stats.not_eligible, color: "text-gray-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Peserta</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Nomor Sertifikat</th>
                <th className="text-left px-3 py-3">Disetujui</th>
                <th className="text-right px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {certs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Belum ada data sertifikat.
                  </td>
                </tr>
              ) : (
                certs.map((cert) => (
                  <CertRow
                    key={cert.id}
                    cert={cert}
                    kelasId={kelas.id}
                    onApprove={handleApprove}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Peserta dengan status "Pending" bisa di-approve manual meski presensi tidak lengkap.
        </p>
      </div>
    </div>
  );
}