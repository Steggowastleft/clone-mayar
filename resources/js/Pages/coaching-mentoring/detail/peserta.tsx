import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail, Phone, Calendar, Award, BookOpen,
  MessageCircle, Download, Printer,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from "lucide-react";

import { format } from "date-fns";
import { id } from "date-fns/locale"; // ✅ FIX

// TYPES
interface PesertaItem {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  status: "aktif" | "pending" | "ditolak";
  tanggal_daftar: string;
  progress: number;
  nilai_rata: number | null;
  form_data?: Record<string, any>;
}

interface Props {
  coachingId: number; // ✅ dipake ini
  pesertaList: PesertaItem[];
}

// STATUS BADGE
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    aktif: { label: "✓ Aktif", className: "bg-green-50 text-green-600 border-green-200" },
    pending: { label: "⏳ Pending", className: "bg-yellow-50 text-yellow-600 border-yellow-200" },
    ditolak: { label: "✕ Ditolak", className: "bg-red-50 text-red-600 border-red-200" },
  };
  const config = map[status] ?? { label: status, className: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}

// PROGRESS
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

// DETAIL DIALOG
function DetailDialog({ peserta, onClose }: { peserta: PesertaItem; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Detail Peserta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-black text-lg">
                {peserta.nama.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{peserta.nama}</p>
              <StatusBadge status={peserta.status} />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {[
              { icon: <Mail className="h-4 w-4 text-gray-400" />, label: "Email", value: peserta.email },
              { icon: <Phone className="h-4 w-4 text-gray-400" />, label: "No HP", value: peserta.no_hp || "-" },
              {
                icon: <Calendar className="h-4 w-4 text-gray-400" />,
                label: "Tanggal Daftar",
                value: format(new Date(peserta.tanggal_daftar), "d MMMM yyyy", { locale: id }) // ✅ FIX
              },
              {
                icon: <Award className="h-4 w-4 text-gray-400" />,
                label: "Nilai Rata-rata",
                value: peserta.nilai_rata !== null ? `${peserta.nilai_rata}` : "Belum ada nilai"
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                {row.icon}
                <div>
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="text-sm font-medium text-gray-800">{row.value}</p>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-3">
              <BookOpen className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-1.5">Progress Belajar</p>
                <ProgressBar value={peserta.progress} />
              </div>
            </div>
          </div>

          {peserta.no_hp && (
            <a
              href={`https://wa.me/${peserta.no_hp.replace(/\D/g, "")}`}
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-xl"
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

// MAIN
export default function TabPeserta({ coachingId, pesertaList }: Props) { // ✅ FIX
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<PesertaItem | null>(null);

  const filtered = pesertaList.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <Input
        placeholder="Cari peserta..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full mt-4">
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.nama}</td>
              <td>
                {format(new Date(p.tanggal_daftar), "d MMMM yyyy", { locale: id })} {/* ✅ FIX */}
              </td>
              <td>
                <button onClick={() => setDetailTarget(p)}>Detail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detailTarget && (
        <DetailDialog peserta={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
    </div>
  );
}