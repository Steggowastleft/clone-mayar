import { useState } from "react";
import { router } from "@inertiajs/react";
import {
  CheckCircle2, XCircle, Clock, Eye, Search,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type PembayaranItem = {
  id: number;
  order_id: string;
  nama_pembeli: string;
  email_pembeli: string;
  jumlah: number;
  status: "pending" | "confirmed" | "rejected";
  bukti_url?: string;
  catatan?: string;
  created_at: string;
  confirmed_at?: string;
};

type Props = {
  bootcampId: number;
  pembayaranList: PembayaranItem[];
};

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: JSX.Element }> = {
    pending:   { label: "Menunggu",   className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock className="h-3 w-3" /> },
    confirmed: { label: "Dikonfirmasi", className: "bg-green-100 text-green-700 border-green-200",  icon: <CheckCircle2 className="h-3 w-3" /> },
    rejected:  { label: "Ditolak",    className: "bg-red-100 text-red-700 border-red-200",          icon: <XCircle className="h-3 w-3" /> },
  };
  const c = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${c.className}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Detail Dialog
// ─────────────────────────────────────────────
function DetailDialog({ item, onClose, onConfirm, onReject }: {
  item: PembayaranItem;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Pembayaran</DialogTitle>
          <DialogDescription>{item.order_id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            {[
              { label: "Nama",       value: item.nama_pembeli },
              { label: "Email",      value: item.email_pembeli },
              { label: "Jumlah",     value: fmt(item.jumlah) },
              { label: "Tanggal",    value: item.created_at },
              { label: "Status",     value: <StatusBadge status={item.status} /> },
              ...(item.catatan ? [{ label: "Catatan", value: item.catatan }] : []),
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <p className="text-xs text-gray-400 w-20 shrink-0">{row.label}</p>
                <div className="flex-1 text-sm font-medium text-gray-800">{row.value}</div>
              </div>
            ))}
          </div>

          {/* Bukti transfer */}
          {item.bukti_url && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Bukti Transfer</p>
              <a href={item.bukti_url} target="_blank" rel="noopener noreferrer">
                <img src={item.bukti_url} alt="bukti" className="w-full max-h-56 object-contain rounded-xl border border-gray-200 cursor-zoom-in" />
              </a>
              <a
                href={item.bukti_url}
                download
                className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
              >
                <Download className="h-3.5 w-3.5" /> Download bukti
              </a>
            </div>
          )}

          {/* Actions */}
          {item.status === "pending" && (
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                onClick={onReject}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Tolak
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={onConfirm}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Konfirmasi
              </Button>
            </div>
          )}

          {item.status === "confirmed" && item.confirmed_at && (
            <div className="p-3 bg-green-50 rounded-xl text-xs text-green-700">
              ✅ Dikonfirmasi pada {item.confirmed_at}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────
const ROWS = [10, 25, 50];

export default function TabPembayaran({ bootcampId, pembayaranList: initialList }: Props) {
  const [list,        setList]        = useState<PembayaranItem[]>(initialList);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page,        setPage]        = useState(1);
  const [viewing,     setViewing]     = useState<PembayaranItem | null>(null);

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const filtered = list.filter((p) => {
    const matchFilter = filter === "all" || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.nama_pembeli.toLowerCase().includes(q) ||
      p.email_pembeli.toLowerCase().includes(q) || p.order_id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const stats = {
    total:     list.length,
    pending:   list.filter(p => p.status === "pending").length,
    confirmed: list.filter(p => p.status === "confirmed").length,
    rejected:  list.filter(p => p.status === "rejected").length,
  };

  const handleConfirm = (item: PembayaranItem) => {
    router.post(`/pembayaran/${item.id}/confirm`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Pembayaran dikonfirmasi!");
        setList(prev => prev.map(p => p.id === item.id ? { ...p, status: "confirmed" as const } : p));
        setViewing(null);
      },
      onError: () => toast.error("Gagal mengkonfirmasi."),
    });
  };

  const handleReject = (item: PembayaranItem) => {
    router.post(`/pembayaran/${item.id}/reject`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Pembayaran ditolak.");
        setList(prev => prev.map(p => p.id === item.id ? { ...p, status: "rejected" as const } : p));
        setViewing(null);
      },
      onError: () => toast.error("Gagal menolak."),
    });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",       value: stats.total,     color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Pending",     value: stats.pending,   color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Dikonfirmasi",value: stats.confirmed, color: "text-green-600",  bg: "bg-green-50" },
          { label: "Ditolak",     value: stats.rejected,  color: "text-red-600",    bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-700 text-sm">Daftar Pembayaran</h3>
          <div className="flex items-center gap-2">
            {/* Filter status */}
            <select
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700"
            >
              <option value="all">Semua</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="rejected">Ditolak</option>
            </select>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Cari nama / email..."
                className="pl-8 h-8 text-xs w-44"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Order ID", "Nama", "Email", "Jumlah", "Status", "Tanggal", "Aksi"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    Belum ada pembayaran
                  </td>
                </tr>
              ) : paginated.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.order_id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nama_pembeli}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.email_pembeli}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{fmt(p.jumlah)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{p.created_at}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewing(p)}
                      className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition font-bold"
                    >
                      <Eye className="h-3.5 w-3.5" /> Lihat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="border border-gray-200 rounded px-1.5 py-0.5 text-xs"
            >
              {ROWS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1">
              {filtered.length === 0 ? "0-0" : `${(safePage-1)*rowsPerPage+1}–${Math.min(safePage*rowsPerPage, filtered.length)}`} of {filtered.length}
            </span>
            <button onClick={() => setPage(1)} disabled={safePage===1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronsLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={safePage===1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={safePage===totalPages} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => setPage(totalPages)} disabled={safePage===totalPages} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronsRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      {viewing && (
        <DetailDialog
          item={viewing}
          onClose={() => setViewing(null)}
          onConfirm={() => handleConfirm(viewing)}
          onReject={() => handleReject(viewing)}
        />
      )}
    </div>
  );
}