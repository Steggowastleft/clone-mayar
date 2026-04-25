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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Share Link Penggalangan Dana
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: `COPY LINK ${shareLabel}`,
              url: `${baseUrl}/penggalangan-dana/${produk?.id}`,
            },
            {
              label: "COPY HALAMAN PRODUK",
              url: `${baseUrl}/penggalangan-dana/${produk?.id}`,
            },
          ].map((item) => (
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

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700 flex items-center"
                  title="Buka di tab baru"
                >
                  <Code2 className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Share link di atas ke sosial media, whatsapp, telegram, tiktok,
          landing page, email atau channel penjualan lainnya untuk menerima {shareDesc}.
        </p>
      </div>

      {/* Detail Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-sm text-gray-500 w-56 align-top">
                  {row.label}
                </td>
                <td className="px-5 py-3 text-sm text-gray-800">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cerita / Deskripsi</DialogTitle>
            <DialogDescription>Deskripsi lengkap penggalangan dana ini.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
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
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {produk?.tujuan || "Tidak ada tujuan."}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={penerimaOpen} onOpenChange={setPenerimaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Penerima Manfaat</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {produk?.penerima_manfaat || "Tidak ada informasi penerima manfaat."}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rincianOpen} onOpenChange={setRincianOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rincian Penggunaan Dana</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {produk?.rincian_penggunaan || "Tidak ada rincian."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}