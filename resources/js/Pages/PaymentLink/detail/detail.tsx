import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Code2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type PaymentLinkData } from "../Show";

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
      label: "COPY LINK PEMBAYARAN",
      url: `${baseUrl}/p/${link.slug}`,
      openable: false,
    },
    {
      label: "COPY HALAMAN LINK",
      url: `${baseUrl}/payment-link/${link.id}`,
      openable: true,
    },
  ];

  return (
    <>
      {/* Share Links */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Share Link untuk Menerima Pembayaran
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {shareLinks.map((item) => (
            <div key={item.label}>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-md text-xs text-gray-500 truncate">
                {item.url}
              </div>
              <div className="flex">
                <button
                  onClick={() => navigator.clipboard.writeText(item.url)}
                  className="flex-1 py-2 bg-white border border-t-0 border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Copy className="h-3 w-3" /> {item.label}
                </button>
                {item.openable ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700 flex items-center"
                    title="Buka di tab baru"
                  >
                    <Code2 className="h-4 w-4" />
                  </a>
                ) : (
                  <button className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700">
                    <Code2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">
          Share link diatas ke sosial media, whatsapp, telegram, tiktok, landing page, email atau
          channel penjualan lainnya untuk menerima pembayaran.
        </p>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-sm text-gray-500 w-56 align-top">{row.label}</td>
                <td className="px-5 py-3 text-sm text-gray-800">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Dibuat Tanggal: {link.created_at}</p>
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
