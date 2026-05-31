import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Code2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PaymentLinkData } from "../Show";
import { toast } from "sonner";

// ─── Helper: format rupiah ───────────────────────────────
function formatRupiah(val: number): string {
  return val.toLocaleString("id-ID");
}

// ─── Main ────────────────────────────────────────────────
export default function TabDetail({ link }: { link: PaymentLinkData }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const baseUrl = window.location.origin;

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            link.status === "published"
              ? "bg-green-500"
              : link.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {link.status}
        </Badge>
      ),
    },
    { label: "Nama", value: link.nama },
    {
      label: "Harga",
      value: (
        <span className="font-semibold text-gray-800">
          Rp {formatRupiah(link.harga)}
        </span>
      ),
    },
    {
      label: "Harga Coret",
      value: link.harga_coret ? (
        <span className="line-through text-gray-400">
          Rp {formatRupiah(link.harga_coret)}
        </span>
      ) : (
        "-"
      ),
    },
    {
      label: "Deskripsi",
      value: (
        <button
          onClick={() => setDeskOpen(true)}
          className="text-blue-600 text-sm underline hover:text-blue-800 flex items-center gap-1"
        >
          <ChevronDown className="h-3 w-3" /> Lihat Deskripsi
        </button>
      ),
    },
    {
      label: "Waktu Mulai Penjualan",
      value: link.waktu_mulai_jual || "-",
    },
    {
      label: "Tanggal Kadaluarsa",
      value: link.tanggal_kadaluarsa || "-",
    },
    {
      label: "Pesan Setelah Bayar",
      value: link.pesan_setelah_bayar ? (
        <span className="text-gray-700 text-sm whitespace-pre-wrap">
          {link.pesan_setelah_bayar.length > 100
            ? link.pesan_setelah_bayar.slice(0, 100) + "..."
            : link.pesan_setelah_bayar}
        </span>
      ) : (
        "-"
      ),
    },
    {
      label: "Kuota / Maks. Pembayaran",
      value: link.maksimum_pembayaran && link.maksimum_pembayaran > 0
        ? `${link.maksimum_pembayaran.toLocaleString("id-ID")} pembayaran`
        : "Unlimited",
    },
    {
      label: "Redirect URL",
      value: link.redirect_url ? (
        <a
          href={link.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm break-all"
        >
          {link.redirect_url}
        </a>
      ) : (
        "-"
      ),
    },
    {
      label: "Bisa Affiliate",
      value: link.bisa_affiliate ? (
        <Badge className="bg-green-100 text-green-700 border border-green-200">Ya</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-600 border border-gray-200">Tidak</Badge>
      ),
    },
    {
      label: "Cover",
      value: link.cover_url ? (
        <img
          src={link.cover_url}
          alt="cover"
          className="h-20 w-32 object-cover rounded-md"
        />
      ) : (
        <span className="text-gray-400 text-sm">Tidak ada gambar</span>
      ),
    },
  ];

  const shareLinks = [
    {
      label: "Tautan Pembayaran (Checkout)",
      url: `${baseUrl}/p/${link.slug}`,
    },
    {
      label: "Halaman Detail Link",
      url: `${baseUrl}/payment-link/${link.id}`,
    },
  ];

  return (
    <>
      {/* Share Links */}
      <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 mb-5 space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Bagi Tautan untuk Menerima Pembayaran
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shareLinks.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={item.url}
                  className="bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-600 select-all h-9"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    toast.success(`${item.label} berhasil disalin!`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 h-9"
                  size="sm"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition">
                  <td className="px-5 py-4 text-xs font-bold text-slate-550 w-56 border-r border-slate-200 bg-slate-50/30 whitespace-nowrap align-top">{row.label}</td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-700">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Centered Created At */}
        <div className="text-center py-3 border border-blue-150 rounded-lg text-blue-650 font-bold bg-white mt-5 text-xs">
          Dibuat tanggal {link.created_at || "-"}
        </div>
      </div>

      {/* Deskripsi Dialog */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
            <DialogDescription>Deskripsi lengkap link pembayaran ini.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {link.deskripsi || "Tidak ada deskripsi."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
