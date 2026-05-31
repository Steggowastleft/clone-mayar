import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


type Props = {
  bootcamp: any;
};

function formatDate(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


function formatDateTime(date?: string) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value?: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function DetailTab({ bootcamp }: Props) {
  const baseUrl = window.location.origin;
  const shareLink = bootcamp?.slug
    ? `${baseUrl}/bootcamp/${bootcamp.slug}`
    : `${baseUrl}/bootcamp/${bootcamp?.id}`;

  const rows = [
    {
      label: "Status",
      value: (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border
          ${bootcamp?.status === "published"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {bootcamp?.status?.toUpperCase() || "UNPUBLISHED"}
        </span>
      ),
    },
    { label: "Nama Bootcamp", value: <span className="font-bold text-slate-800">{bootcamp?.name || "-"}</span> },
    {
      label: "Harga",
      value: (
        <span className="font-extrabold text-blue-600 text-sm">
          {bootcamp?.harga && bootcamp.harga > 0 ? formatCurrency(bootcamp.harga) : "Gratis"}
        </span>
      ),
    },
    { label: "Batch", value: <span className="font-semibold text-slate-700">{bootcamp?.batch || "-"}</span> },
    { label: "Waktu Mulai Penjualan", value: <span className="font-semibold text-slate-700">{formatDateTime(bootcamp?.tanggal_mulai_jual)}</span> },
    { label: "Tanggal Kadaluarsa", value: <span className="font-semibold text-slate-700">{formatDate(bootcamp?.tanggal_tutup_daftar)}</span> },
    { label: "Tanggal Mulai Pembelajaran", value: <span className="font-semibold text-slate-700">{formatDate(bootcamp?.tanggal_mulai_pembelajaran)}</span> },
    { label: "Tanggal Akhir Pembelajaran", value: <span className="font-semibold text-slate-700">{formatDate(bootcamp?.tanggal_batas_pembelajaran)}</span> },
    ...(bootcamp?.deskripsi ? [{
      label: "Deskripsi",
      value: <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{bootcamp.deskripsi}</p>
    }] : []),
    ...(bootcamp?.instruksi ? [{
      label: "Instruksi",
      value: <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{bootcamp.instruksi}</p>
    }] : []),
    ...(bootcamp?.syarat_ketentuan ? [{
      label: "Syarat & Ketentuan",
      value: <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{bootcamp.syarat_ketentuan}</p>
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* SHARE LINK */}
      <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Bagi Tautan untuk Menerima Pendaftaran
        </h3>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tautan Pendaftaran (Checkout)</span>
          <div className="flex gap-2 max-w-xl">
            <Input
              readOnly
              value={shareLink}
              className="bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-600 select-all h-9"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success("Tautan pendaftaran berhasil disalin!");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 h-9"
              size="sm"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* DETAIL TABLE CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        <h2 className="font-extrabold text-slate-800 text-sm mb-4">Informasi Detail</h2>
        
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition">
                  <td className="px-5 py-4 text-xs font-bold text-slate-550 w-56 border-r border-slate-200 bg-slate-50/30 whitespace-nowrap align-top">
                    {row.label}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-700">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Centered Created At */}
        <div className="text-center py-3 border border-blue-150 rounded-lg text-blue-650 font-bold bg-white mt-5 text-xs">
          Dibuat tanggal {bootcamp?.created_at ? formatDate(bootcamp.created_at) : "-"}
        </div>
      </div>
    </div>
  );
}