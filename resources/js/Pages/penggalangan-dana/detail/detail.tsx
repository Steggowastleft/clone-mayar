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
import { type PenggalanganDana } from "../detail";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TabDetail({ produk }: { produk: PenggalanganDana }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const [tujuanOpen, setTujuanOpen] = useState(false);
  const [rincianOpen, setRincianOpen] = useState(false);
  const [penerimaOpen, setPenerimaOpen] = useState(false);
  const baseUrl = window.location.origin;

  const formatRupiah = (val?: number | null) =>
    `Rp ${(val ?? 0).toLocaleString("id-ID")}`;

  const formatTanggal = (iso?: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTanggalWaktu = (iso?: string | null) => {
    if (!iso) return "-";
    return (
      new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    );
  };

  const statusBadge = (
    <Badge
      className={cn(
        "text-white text-xs",
        produk?.status === "published"
          ? "bg-green-500"
          : produk?.status === "unlisted"
          ? "bg-gray-500"
          : "bg-yellow-500"
      )}
    >
      {produk?.status ?? "-"}
    </Badge>
  );

  const affiliateBadge = produk?.affiliate_enabled ? (
    <Badge className="bg-green-100 text-green-700 border border-green-200">Ya</Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-600 border border-gray-200">Tidak</Badge>
  );

  const coverEl = produk?.cover ? (
    <img
      src={produk.cover_url || `/storage/${produk.cover}`}
      alt="cover"
      className="h-20 w-32 object-cover rounded-md"
    />
  ) : (
    <span className="text-gray-400 text-sm">Tidak ada gambar</span>
  );

  const btnLihat = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className="text-blue-600 text-sm underline hover:text-blue-800 flex items-center gap-1"
    >
      <ChevronDown className="h-3 w-3" /> {label}
    </button>
  );

  const kosong = <span className="text-gray-400 text-sm">Belum diisi</span>;

  // ─── Rows DONASI ─────────────────────────────────────────────────────────
  const donasiRows = [
    { label: "Status",         value: statusBadge },
    { label: "Nama",           value: produk?.nama ?? "-" },
    { label: "Kategori",       value: produk?.kategori || "-" },
    { label: "Target Dana",    value: formatRupiah(produk?.harga) },
    { label: "Minimal Donasi", value: produk?.minimal_donasi != null ? formatRupiah(produk.minimal_donasi) : "Tidak ada batas minimum" },
    { label: "Dana Terkumpul", value: formatRupiah(produk?.terkumpul) },
    { label: "Jumlah Donatur", value: `${produk?.pembeli ?? 0} orang` },
    { label: "Waktu Mulai Penjualan", value: formatTanggalWaktu(produk?.tanggal_mulai_jual) },
    { label: "Batas Waktu Donasi",    value: produk?.tanggal_tutup ? formatTanggal(produk.tanggal_tutup) : "Tidak dibatasi" },
    {
      label: "Tampilkan Target",
      value: produk?.tampilkan_target
        ? <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Ditampilkan</Badge>
        : <Badge className="bg-gray-100 text-gray-600 border border-gray-200">Disembunyikan</Badge>,
    },
    {
      label: "Tampilkan Pencairan",
      value: produk?.tampilkan_pencairan
        ? <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Ditampilkan</Badge>
        : <Badge className="bg-gray-100 text-gray-600 border border-gray-200">Disembunyikan</Badge>,
    },
    { label: "Tujuan Donasi",          value: produk?.tujuan            ? btnLihat("Lihat Tujuan", () => setTujuanOpen(true))           : kosong },
    { label: "Penerima Manfaat",       value: produk?.penerima_manfaat  ? btnLihat("Lihat Penerima Manfaat", () => setPenerimaOpen(true)) : kosong },
    { label: "Rincian Penggunaan Dana", value: produk?.rincian_penggunaan ? btnLihat("Lihat Rincian", () => setRincianOpen(true))        : kosong },
    { label: "Cerita / Deskripsi",     value: btnLihat("Lihat Deskripsi", () => setDeskOpen(true)) },
    { label: "Bisa Affiliate",         value: affiliateBadge },
    { label: "Cover",                  value: coverEl },
  ];

  // ─── Rows QURBAN ─────────────────────────────────────────────────────────
  const qurbanRows = [
    { label: "Status",       value: statusBadge },
    { label: "Nama",         value: produk?.nama ?? "-" },
    { label: "Jenis Hewan",  value: produk?.jenis_hewan || "-" },
    { label: "Harga Per Ekor", value: formatRupiah(produk?.harga) },
    ...(produk?.harga_coret != null
      ? [{ label: "Harga Sebelum Diskon", value: formatRupiah(produk.harga_coret) }]
      : []),
    { label: "Stok Tersedia",   value: produk?.stok != null ? `${produk.stok} ekor` : "Tidak dibatasi" },
    { label: "Terjual",         value: `${produk?.pembeli ?? 0} ekor` },
    { label: "Total Terkumpul", value: formatRupiah(produk?.terkumpul) },
    { label: "Waktu Mulai Penjualan",         value: formatTanggalWaktu(produk?.tanggal_mulai_jual) },
    { label: "Batas Waktu Pembayaran Qurban", value: produk?.tanggal_tutup ? formatTanggal(produk.tanggal_tutup) : "Tidak dibatasi" },
    { label: "Cerita / Deskripsi", value: btnLihat("Lihat Deskripsi", () => setDeskOpen(true)) },
    { label: "Bisa Affiliate",     value: affiliateBadge },
    { label: "Cover",              value: coverEl },
  ];

  // ─── Rows WAKAF ──────────────────────────────────────────────────────────
  const wakafRows = [
    { label: "Status",         value: statusBadge },
    { label: "Nama",           value: produk?.nama ?? "-" },
    { label: "Target Wakaf",   value: formatRupiah(produk?.harga) },
    { label: "Minimal Donasi", value: produk?.minimal_donasi != null ? formatRupiah(produk.minimal_donasi) : "Tidak ada batas minimum" },
    { label: "Dana Terkumpul", value: formatRupiah(produk?.terkumpul) },
    { label: "Jumlah Donatur", value: `${produk?.pembeli ?? 0} orang` },
    { label: "Waktu Mulai Penjualan", value: formatTanggalWaktu(produk?.tanggal_mulai_jual) },
    { label: "Batas Waktu Wakaf",     value: produk?.tanggal_tutup ? formatTanggal(produk.tanggal_tutup) : "Tidak dibatasi" },
    {
      label: "Tampilkan Target",
      value: produk?.tampilkan_target
        ? <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Ditampilkan</Badge>
        : <Badge className="bg-gray-100 text-gray-600 border border-gray-200">Disembunyikan</Badge>,
    },
    { label: "Tujuan Wakaf",            value: produk?.tujuan            ? btnLihat("Lihat Tujuan", () => setTujuanOpen(true))           : kosong },
    { label: "Penerima Manfaat",        value: produk?.penerima_manfaat  ? btnLihat("Lihat Penerima Manfaat", () => setPenerimaOpen(true)) : kosong },
    { label: "Rincian Penggunaan Dana", value: produk?.rincian_penggunaan ? btnLihat("Lihat Rincian", () => setRincianOpen(true))         : kosong },
    { label: "Cerita / Deskripsi",      value: btnLihat("Lihat Deskripsi", () => setDeskOpen(true)) },
    { label: "Bisa Affiliate",          value: affiliateBadge },
    { label: "Cover",                   value: coverEl },
  ];

  const rows =
    produk?.tipe === "donasi" ? donasiRows :
    produk?.tipe === "qurban" ? qurbanRows :
    wakafRows;

  const shareLabel =
    produk?.tipe === "donasi" ? "DONASI" :
    produk?.tipe === "qurban" ? "PEMBELIAN QURBAN" :
    "WAKAF";

  const shareDesc =
    produk?.tipe === "donasi" ? "donasi" :
    produk?.tipe === "qurban" ? "pembelian qurban" :
    "wakaf";

  return (
    <>
      {/* Share Links */}
      <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 mb-5 space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Bagi Tautan untuk Menerima {shareLabel}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: `Tautan ${shareLabel} (Checkout)`,
              url: `${baseUrl}/penggalangan-dana/${produk?.id}`,
            },
            {
              label: "Halaman Detail Produk",
              url: `${baseUrl}/penggalangan-dana/${produk?.id}`,
            },
          ].map((item) => (
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

        <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
          Share link di atas ke sosial media, whatsapp, telegram, tiktok,
          landing page, email atau channel penjualan lainnya untuk menerima {shareDesc}.
        </p>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition">
                  <td className="px-5 py-4 text-xs font-bold text-slate-550 w-56 border-r border-slate-200 bg-slate-50/30 whitespace-nowrap align-top animate-none">
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
          Dibuat tanggal {formatTanggal(produk?.created_at)}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cerita / Deskripsi</DialogTitle>
            <DialogDescription>Deskripsi lengkap penggalangan dana ini.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {produk?.deskripsi || "Tidak ada deskripsi."}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tujuanOpen} onOpenChange={setTujuanOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {produk?.tipe === "wakaf" ? "Tujuan Wakaf" : "Tujuan Donasi"}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {produk?.tujuan || "Tidak ada tujuan."}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={penerimaOpen} onOpenChange={setPenerimaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Penerima Manfaat</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {produk?.penerima_manfaat || "Tidak ada informasi penerima manfaat."}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rincianOpen} onOpenChange={setRincianOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rincian Penggunaan Dana</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {produk?.rincian_penggunaan || "Tidak ada rincian."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}