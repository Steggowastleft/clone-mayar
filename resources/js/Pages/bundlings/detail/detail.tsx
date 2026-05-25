import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import type { Bundling } from "../show";

export default function TabDetail({ bundling }: { bundling: Bundling }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const baseUrl = window.location.origin;

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            bundling.status === "published" ? "bg-green-500" : "bg-yellow-500"
          )}
        >
          {bundling.status}
        </Badge>
      ),
    },
    { label: "Nama Bundling", value: bundling.nama },
    {
      label: "URL Bundling",
      value: `${baseUrl}/p/${bundling.id}/bundling`,
    },
    { label: "Tipe Pembayaran", value: bundling.tipe_pembayaran },
    {
      label: "Harga",
      value: (
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">
            Rp {bundling.harga.toLocaleString("id-ID")}
          </span>
          {bundling.harga_coret && (
            <span className="text-xs text-gray-400 line-through">
              Rp {bundling.harga_coret.toLocaleString("id-ID")}
            </span>
          )}
        </div>
      ),
    },
    { label: "Terjual", value: `${bundling.jumlah_terjual} paket` },
    {
      label: "Maks. Pembayaran",
      value: bundling.maksimal_pembayaran ? `${bundling.maksimal_pembayaran} unit` : "-",
    },
    {
      label: "Kadaluarsa",
      value: bundling.tanggal_kadaluarsa
        ? format(new Date(bundling.tanggal_kadaluarsa), "dd MMMM yyyy", { locale: idLocale })
        : "-",
    },
    {
      label: "Bisa Affiliate",
      value: bundling.bisa_affiliate ? "Ya" : "Tidak",
    },
    {
      label: "Redirect URL",
      value: bundling.redirect_url || "-",
    },
    {
      label: "Deskripsi",
      value: (
        <button
          onClick={() => setDeskOpen(true)}
          className="text-blue-600 text-sm underline"
        >
          Lihat Deskripsi
        </button>
      ),
    },
  ];

  return (
    <>
      {/* SHARE LINK */}
      <div className="bg-white border rounded-lg p-5 mb-5">
        <h3 className="font-semibold mb-4 text-gray-800">Share Link</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "COPY LINK PENDAFTARAN",
              url: `${baseUrl}/p/${bundling.id}/bundling`,
            },
            {
              label: "OPEN KATALOG",
              url: `${baseUrl}/bundling/catalog`,
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="px-3 py-2 bg-gray-50 border text-xs truncate text-gray-500">
                {item.url}
              </div>
              <button
                onClick={() => {
                  if (item.label.includes("COPY")) {
                    navigator.clipboard.writeText(item.url);
                  } else {
                    window.open(item.url, "_blank");
                  }
                }}
                className="w-full py-2 border text-xs flex items-center justify-center gap-2 hover:bg-gray-50 transition"
              >
                <Copy className="h-3 w-3" />
                {item.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DETAIL TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="px-5 py-3 text-sm text-gray-500 w-56 bg-gray-50/50">
                  {row.label}
                </td>
                <td className="px-5 py-3 text-sm text-gray-800">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRODUK LIST */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Produk dalam Bundling ({bundling.items.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundling.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-100 transition"
            >
              <div className="h-14 w-14 rounded-lg overflow-hidden border bg-white shrink-0">
                {item.cover ? (
                  <img src={item.cover} alt={item.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <Package className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{item.nama}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {item.tipe}
                  </span>
                  <span className="text-xs text-gray-500">
                    Rp {item.harga.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DESKRIPSI */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deskripsi Bundling</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            {bundling.deskripsi || "Tidak ada deskripsi tersedia."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
