import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface KelasOnline {
  id: number;
  slug?: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  is_gratis: boolean;
  status: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  require_quiz_sertifikat: boolean;
  nilai_minimum_quiz: number | null;
  has_assignment: boolean;
  thumbnail: string | null;
  created_at?: string;
}

interface Props {
  kelas: KelasOnline;
  isOwner: boolean;
}

export default function TabDetail({ kelas, isOwner }: Props) {
  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/p/${kelas.id}/kelas-online`;

  const rows = [
    {
      label: "Status",
      value: (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border
          ${kelas.status === "published"   ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            kelas.status === "unpublished" ? "bg-yellow-50 text-yellow-750 border-yellow-200" :
            "bg-blue-50 text-blue-700 border-blue-200"}`}>
          {kelas.status.toUpperCase()}
        </span>
      )
    },
    { label: "Nama Kelas", value: <span className="font-bold text-slate-800">{kelas.nama}</span> },
    {
      label: "Harga",
      value: (
        <span className="font-extrabold text-blue-600 text-sm">
          {kelas.is_gratis ? "Gratis" : `Rp ${Number(kelas.harga).toLocaleString("id-ID")}`}
        </span>
      )
    },
    ...(kelas.tanggal_mulai ? [{
      label: "Tanggal Mulai",
      value: (
        <span className="font-semibold text-slate-700">
          {new Date(kelas.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      )
    }] : []),
    ...(kelas.tanggal_selesai ? [{
      label: "Tanggal Selesai",
      value: (
        <span className="font-semibold text-slate-700">
          {new Date(kelas.tanggal_selesai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      )
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Utama */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
            <h2 className="font-extrabold text-slate-800 text-sm mb-4">Informasi Kelas</h2>

            {kelas.thumbnail && (
              <img
                src={`/storage/${kelas.thumbnail}`}
                alt={kelas.nama}
                className="w-full h-48 object-cover rounded-xl mb-6 border border-slate-100 shadow-sm"
              />
            )}

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

            {/* Bottom Created At */}
            <div className="text-center py-3 border border-blue-150 rounded-lg text-blue-650 font-bold bg-white mt-5 text-xs">
              Dibuat tanggal {kelas.created_at ? new Date(kelas.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric"
              }) : "-"}
            </div>
          </div>

        {kelas.deskripsi && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Deskripsi</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{kelas.deskripsi}</p>
          </div>
        )}
      </div>

      {/* Konfigurasi — tanpa diskusi */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3 text-sm">⚙️ Konfigurasi</h2>
          <div className="space-y-2.5">
            {/* Hanya assignment — diskusi dihapus */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Assignment</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                ${kelas.has_assignment ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {kelas.has_assignment ? "Aktif" : "Tidak Aktif"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Quiz wajib sertifikat</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                ${kelas.require_quiz_sertifikat ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {kelas.require_quiz_sertifikat ? "Ya" : "Tidak"}
              </span>
            </div>
            {kelas.require_quiz_sertifikat && kelas.nilai_minimum_quiz !== null && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Nilai minimum quiz</span>
                <span className="font-semibold text-gray-800">{kelas.nilai_minimum_quiz}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-5">
          <h2 className="font-bold text-indigo-800 text-sm mb-3">📜 Syarat Sertifikat</h2>
          <ul className="space-y-2 text-xs text-indigo-700">
            <li className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold">1</span>
              Presensi awal, tengah, dan akhir
            </li>
            {kelas.require_quiz_sertifikat && (
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold">2</span>
                Nilai quiz min. {kelas.nilai_minimum_quiz ?? "—"}
              </li>
            )}
            <li className="flex items-start gap-2 mt-2 pt-2 border-t border-indigo-200">
              <span className="text-indigo-400 mt-0.5">ℹ️</span>
              <span className="text-indigo-600">
                Kendala presensi? Hubungi penyelenggara untuk approval manual.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
}