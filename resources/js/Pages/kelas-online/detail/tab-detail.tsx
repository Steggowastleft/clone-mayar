import { useState } from "react";
import { Copy, Check } from "lucide-react";

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
}

interface Props {
  kelas: KelasOnline;
  isOwner: boolean;
}

export default function TabDetail({ kelas, isOwner }: Props) {
  const [copied, setCopied] = useState(false);
  const shareLink = `${window.location.origin}/kelas-online/${kelas.id}`;

  return (
    <div className="space-y-6">
      {/* SHARE LINK */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4">
          Share Link untuk Menerima Pendaftaran
        </h3>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-full flex items-center justify-between gap-3 bg-gray-50 hover:bg-gray-100 border rounded-xl px-4 py-3 text-left transition"
          >
            <span className="text-sm text-blue-600 break-all">
              {shareLink}
            </span>

            <span className="shrink-0 text-gray-500">
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </span>
          </button>

          <p className="text-sm text-gray-500 leading-relaxed">
            Klik link di atas untuk menyalin otomatis. Bagikan ke WhatsApp,
            Telegram, TikTok, landing page, email, atau channel lain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Info Utama */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Informasi Kelas</h2>

          {kelas.thumbnail && (
            <img
              src={`/storage/${kelas.thumbnail}`}
              alt={kelas.nama}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
          )}

          <div className="space-y-3 text-sm">
            {[
              { label: "Nama Kelas",    value: kelas.nama },
              { label: "Status",        value: kelas.status, isStatus: true },
              { label: "Harga",         value: kelas.is_gratis ? "Gratis" : `Rp ${Number(kelas.harga).toLocaleString("id-ID")}` },
              kelas.tanggal_mulai
                ? { label: "Tanggal Mulai",   value: new Date(kelas.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) }
                : null,
              kelas.tanggal_selesai
                ? { label: "Tanggal Selesai", value: new Date(kelas.tanggal_selesai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) }
                : null,
            ].filter(Boolean).map(({ label, value, isStatus }: any, i, arr) => (
              <div
                key={label}
                className={`flex justify-between items-center py-2 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-gray-500">{label}</span>
                {isStatus ? (
                  <span className={`font-semibold text-xs px-2.5 py-0.5 rounded-full
                    ${value === "aktif"   ? "bg-emerald-100 text-emerald-700" :
                      value === "draft"   ? "bg-gray-100 text-gray-600" :
                      value === "selesai" ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-600"}`}>
                    {value}
                  </span>
                ) : (
                  <span className="font-semibold text-gray-800">{value}</span>
                )}
              </div>
            ))}
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