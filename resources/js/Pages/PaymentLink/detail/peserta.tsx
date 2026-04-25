import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Printer, Download, MessageCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  User, Mail, Phone, Calendar, BookOpen, Award, X,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type PesertaItem = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  status: string;
  tanggal_daftar: string;         // ISO string
  progress: number;               // 0–100
  nilai_rata: number | null;      // null = belum ada nilai
  form_data?: Record<string, any>; // jawaban kustom form
};

type Props = {
  eventId: number;
  pesertaList: PesertaItem[];
};

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    aktif:    { label: "Aktif",    className: "bg-green-100 text-green-700 border-green-200" },
    active:   { label: "Aktif",    className: "bg-green-100 text-green-700 border-green-200" },
    pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    ditolak:  { label: "Ditolak",  className: "bg-red-100 text-red-700 border-red-200" },
    rejected: { label: "Ditolak",  className: "bg-red-100 text-red-700 border-red-200" },
    inactive: { label: "Nonaktif", className: "bg-gray-100 text-gray-600 border-gray-200" },
  };
  const config = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 75 ? "bg-green-500" : pct >= 40 ? "bg-blue-500" : "bg-gray-300";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Detail Dialog
// ─────────────────────────────────────────────
function DetailDialog({ peserta, onClose }: { peserta: PesertaItem; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Detail Peserta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Avatar + nama */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-blue-600 font-black text-lg">
                {peserta.nama.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{peserta.nama}</p>
              <StatusBadge status={peserta.status} />
            </div>
          </div>

          {/* Info grid */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {[
              { icon: <Mail className="h-4 w-4 text-gray-400" />,     label: "Email",          value: peserta.email },
              { icon: <Phone className="h-4 w-4 text-gray-400" />,    label: "No HP",          value: peserta.no_hp || "-" },
              { icon: <Calendar className="h-4 w-4 text-gray-400" />, label: "Tanggal Daftar", value: format(new Date(peserta.tanggal_daftar), "d MMMM yyyy", { locale: idLocale }) },
              { icon: <Award className="h-4 w-4 text-gray-400" />,    label: "Nilai Rata-rata", value: peserta.nilai_rata !== null ? `${peserta.nilai_rata}` : "Belum ada nilai" },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{row.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="text-sm font-medium text-gray-800 break-all">{row.value}</p>
                </div>
              </div>
            ))}

            {/* Progress */}
            <div className="flex items-start gap-3">
              <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1.5">Progress Belajar</p>
                <ProgressBar value={peserta.progress} />
              </div>
            </div>
          </div>

          {/* Form data kustom */}
          {peserta.form_data && Object.keys(peserta.form_data).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Data Form Pendaftaran</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {Object.entries(peserta.form_data).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-400">{key}</p>
                    <p className="text-sm font-medium text-gray-800">{String(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aksi WhatsApp */}
          {peserta.no_hp && (
            <a
              href={`https://wa.me/${peserta.no_hp.replace(/\D/g, "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition"
            >
              <MessageCircle className="h-4 w-4" />
              Hubungi via WhatsApp
            </a>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Export CSV
// ─────────────────────────────────────────────
function exportCSV(pesertaList: PesertaItem[]) {
  const headers = ["Nama", "Email", "No HP", "Status", "Tanggal Daftar", "Progress (%)", "Nilai Rata-rata"];
  const rows = pesertaList.map((p) => [
    p.nama,
    p.email,
    p.no_hp || "",
    p.status,
    format(new Date(p.tanggal_daftar), "dd/MM/yyyy"),
    p.progress,
    p.nilai_rata ?? "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `peserta-event-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function TabPeserta({ eventId, pesertaList }: Props) {
  const [search, setSearch]         = useState("");
  const [progressFilter, setProgressFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [page, setPage]             = useState(1);
  const [detailTarget, setDetailTarget] = useState<PesertaItem | null>(null);

  // ── Filter ───────────────────────────────────
  const filtered = pesertaList.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.nama.toLowerCase().includes(q)
      || p.email.toLowerCase().includes(q)
      || (p.no_hp || "").includes(q);
    const matchProgress =
      progressFilter === "all"    ? true :
      progressFilter === "0"      ? p.progress === 0 :
      progressFilter === "75"     ? p.progress >= 75 && p.progress < 100 :
      progressFilter === "100"    ? p.progress === 100 : true;
    return matchStatus && matchSearch && matchProgress;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  // ── Stats ────────────────────────────────────
  const stats = {
    total:   pesertaList.length,
    aktif:   pesertaList.filter((p) => p.status === "aktif").length,
    pending: pesertaList.filter((p) => p.status === "pending").length,
    ditolak: pesertaList.filter((p) => p.status === "ditolak").length,
  };

  return (
    <div className="p-6 space-y-5">

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Peserta", value: stats.total,   color: "text-blue-600",  bg: "bg-blue-50" },
          { label: "Aktif",         value: stats.aktif,   color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending",       value: stats.pending, color: "text-yellow-600",bg: "bg-yellow-50" },
          { label: "Ditolak",       value: stats.ditolak, color: "text-red-600",   bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-700">Daftar Peserta</h2>
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filtered.length} Peserta
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter status */}
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-xs border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter progress */}
            <Select value={progressFilter} onValueChange={(v) => { setProgressFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-36 text-xs border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Progress</SelectItem>
                <SelectItem value="0">0% — Belum mulai</SelectItem>
                <SelectItem value="75">≥75% — Hampir selesai</SelectItem>
                <SelectItem value="100">100% — Selesai</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1 transition">
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-50">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input placeholder="Cari nama, email, no HP..."
              className="pl-9 text-sm h-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Peserta", "No HP", "Status", "Tanggal Daftar", "Progress", "Nilai Rata", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    {search || statusFilter !== "all"
                      ? "Tidak ada peserta yang sesuai filter"
                      : "Belum ada peserta yang mendaftar"}
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">

                    {/* Peserta */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="text-blue-600 font-bold text-xs">
                            {p.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{p.nama}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{p.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* No HP */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-sm">{p.no_hp || "-"}</span>
                        {p.no_hp && (
                          <a href={`https://wa.me/${p.no_hp.replace(/\D/g, "")}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-600 transition">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* Tanggal Daftar */}
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                      {format(new Date(p.tanggal_daftar), "d MMM yyyy", { locale: idLocale })}
                    </td>

                    {/* Progress */}
                    <td className="px-5 py-3.5">
                      <ProgressBar value={p.progress} />
                    </td>

                    {/* Nilai Rata */}
                    <td className="px-5 py-3.5">
                      {p.nilai_rata !== null ? (
                        <span className={`font-bold text-sm ${
                          p.nilai_rata >= 75 ? "text-green-600"
                          : p.nilai_rata >= 50 ? "text-yellow-600"
                          : "text-red-500"
                        }`}>
                          {p.nilai_rata}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDetailTarget(p)}
                        className="text-blue-600 hover:text-blue-700 font-bold text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                      >
                        DETAIL
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-xs">Rows per page:</span>
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-7 w-16 text-xs border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 text-xs">
              {filtered.length === 0
                ? "0-0 of 0"
                : `${(safePage - 1) * rowsPerPage + 1}–${Math.min(safePage * rowsPerPage, filtered.length)} of ${filtered.length}`}
            </span>
            <button onClick={() => setPage(1)} disabled={safePage === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition">
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      {detailTarget && (
        <DetailDialog peserta={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
    </div>
  );
}