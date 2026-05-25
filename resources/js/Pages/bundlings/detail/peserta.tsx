import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Printer, Download, MessageCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  User, Mail, Phone, Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export type PesertaItem = {
  id: number;
  nama: string;
  email: string;
  no_wa?: string;
  tanggal_daftar: string;
  status: string;
};

type Props = {
  bundlingId: number;
  pesertaList?: PesertaItem[];
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    aktif:    { label: "Aktif",    className: "bg-green-100 text-green-700 border-green-200" },
    active:   { label: "Aktif",    className: "bg-green-100 text-green-700 border-green-200" },
    pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    ditolak:  { label: "Ditolak",  className: "bg-red-100 text-red-700 border-red-200" },
  };
  const config = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${config.className}`}>
      {config.label}
    </span>
  );
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function TabPeserta({ bundlingId, pesertaList = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = pesertaList.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.nama.toLowerCase().includes(q)
      || p.email.toLowerCase().includes(q)
      || (p.no_wa || "").includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const stats = {
    total:   pesertaList.length,
    aktif:   pesertaList.filter((p) => p.status === "aktif").length,
    pending: pesertaList.filter((p) => p.status === "pending").length,
    ditolak: pesertaList.filter((p) => p.status === "ditolak").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Peserta", value: stats.total,   color: "text-blue-600",  bg: "bg-blue-50" },
          { label: "Aktif",         value: stats.aktif,   color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending",       value: stats.pending, color: "text-yellow-600",bg: "bg-yellow-50" },
          { label: "Ditolak",       value: stats.ditolak, color: "text-red-600",   bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-800 text-sm">Daftar Peserta</h2>
            <Badge variant="secondary" className="bg-blue-600 text-white font-bold text-[10px]">
              {filtered.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="h-8 w-32 text-[10px] font-bold border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">SEMUA STATUS</SelectItem>
                <SelectItem value="aktif">AKTIF</SelectItem>
                <SelectItem value="pending">PENDING</SelectItem>
                <SelectItem value="ditolak">DITOLAK</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[10px] font-bold">
              <Download className="h-3.5 w-3.5" />
              EXPORT
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-50">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input 
              placeholder="Cari nama, email..."
              className="pl-9 text-xs h-9 bg-gray-50/50 border-gray-200"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Peserta", "No. WA", "Status", "Tgl Daftar", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400 text-xs italic">
                    Belum ada peserta yang mendaftar
                  </td>
                </tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 text-blue-600 font-bold text-xs uppercase">
                          {p.nama.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-xs truncate">{p.nama}</p>
                          <p className="text-[10px] text-gray-400 truncate">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">
                      {p.no_wa || "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-gray-500 font-bold whitespace-nowrap">
                      {format(new Date(p.tanggal_daftar), "dd MMM yyyy", { locale: idLocale })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="p-1.5 hover:bg-green-50 text-green-600 rounded-md transition-colors border border-transparent hover:border-green-100">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between text-[10px] text-gray-500 font-bold">
          <div className="flex items-center gap-2">
            <span>ROWS PER PAGE:</span>
            <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-7 w-16 text-[10px] font-black border-gray-200">
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
            <span className="mr-2">
              {filtered.length === 0 ? "0-0 OF 0" : `${(safePage - 1) * rowsPerPage + 1}–${Math.min(safePage * rowsPerPage, filtered.length)} OF ${filtered.length}`}
            </span>
            <button onClick={() => setPage(1)} disabled={safePage === 1} className="p-1 hover:bg-white rounded border disabled:opacity-30 transition shadow-sm">
              <ChevronsLeft className="h-3 w-3" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1 hover:bg-white rounded border disabled:opacity-30 transition shadow-sm">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1 hover:bg-white rounded border disabled:opacity-30 transition shadow-sm">
              <ChevronRight className="h-3 w-3" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="p-1 hover:bg-white rounded border disabled:opacity-30 transition shadow-sm">
              <ChevronsRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}