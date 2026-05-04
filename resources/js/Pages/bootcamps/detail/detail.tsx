import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


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
  const [copied, setCopied] = useState(false);
  const shareLink =
    bootcamp?.slug
      ? `${window.location.origin}/bootcamp/${bootcamp.slug}`
      : `${window.location.origin}/bootcamp/${bootcamp?.id}`;

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

        setTimeout(() => {
          setCopied(false);
        }, 2000);
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

      {/* DETAIL PRODUK */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT INFO */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    bootcamp?.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {bootcamp?.status || "-"}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {bootcamp?.name || "-"}
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                {bootcamp?.kategori || "Kategori belum diisi"}
              </p>
            </div>

            {/* GRID INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Harga",
                  value: formatCurrency(bootcamp?.harga),
                },
                {
                  label: "Batch",
                  value: bootcamp?.batch || "-",
                },
                {
                  label: "Waktu Mulai Penjualan",
                  value: formatDateTime(bootcamp?.tanggal_mulai_jual),
                },
                {
                  label: "Tanggal Kadaluarsa",
                  value: formatDate(bootcamp?.tanggal_tutup_daftar),
                },
                {
                  label: "Tanggal Mulai Pembelajaran",
                  value: formatDate(bootcamp?.tanggal_mulai_pembelajaran),
                },
                {
                  label: "Tanggal Akhir Pembelajaran",
                  value: formatDate(bootcamp?.tanggal_batas_pembelajaran),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 border rounded-xl p-4"
                >
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Deskripsi */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Deskripsi
              </h3>
              <div className="bg-gray-50 border rounded-xl p-4">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {bootcamp?.deskripsi || "Belum ada deskripsi"}
                </p>
              </div>
            </div>

            {/* Instruksi */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Instruksi
              </h3>
              <div className="bg-gray-50 border rounded-xl p-4">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {bootcamp?.instruksi || "Belum ada instruksi"}
                </p>
              </div>
            </div>

            {/* S&K */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                Syarat & Ketentuan
              </h3>
              <div className="bg-gray-50 border rounded-xl p-4">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {bootcamp?.syarat_ketentuan || "Belum ada syarat & ketentuan"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COVER */}
          <div className="w-full lg:w-[320px] shrink-0">
            {bootcamp?.cover_url ? (
              <img
                src={bootcamp.cover_url}
                alt={bootcamp.name}
                className="w-full h-[220px] object-cover rounded-2xl border"
              />
            ) : (
              <div className="w-full h-[220px] rounded-2xl border bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                Belum ada cover
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}