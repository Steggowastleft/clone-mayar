import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  CheckCircle2,
  Info,
  MonitorPlay,
  Video,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Link2,
  Heart,
  Sparkles,
  Table,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  counts?: Record<string, number>;
};

const EXPORT_OPTIONS = [
  {
    value: "all",
    label: "Semua Laporan Produk",
    desc: "Ekspor ringkasan seluruh produk Anda secara terpadu dalam satu file CSV.",
    icon: Sparkles,
    color: "from-blue-600 to-indigo-600 text-white",
    bgColor: "bg-gradient-to-br",
    columns: ["ID Produk", "Nama Produk", "Jenis Produk", "Kategori/Tipe", "Harga (Formatted)", "Harga (Numerik)", "Status", "Statistik", "Keterangan", "Dibuat"],
    previewRows: [
      ["PRD-001", "Mastering React 19", "Kelas Online", "Berbayar", "Rp 299.000", "299000", "Aktif", "42 Peserta", "Wajib Sertifikat: Ya", "19 Jun 2026 09:44 WIB"],
      ["PRD-002", "Tailwind CSS Intensive", "Pelatihan", "Desain", "Rp 499.000", "499000", "Aktif", "12 Peserta", "Batch: 2", "18 Jun 2026 14:00 WIB"],
      ["PRD-003", "AI & Web Development", "Webinar", "Gratis", "Rp 0", "0", "Aktif", "125 Pendaftar", "Mulai: 25 Jun 2026 19:00 WIB", "17 Jun 2026 11:20 WIB"],
    ],
  },
  {
    value: "kelas-online",
    label: "Kelas Online",
    desc: "Laporan lengkap tentang modul kelas online, status sertifikat, dan jumlah peserta.",
    icon: MonitorPlay,
    color: "text-blue-600 bg-blue-50 border-blue-100",
    bgColor: "bg-white",
    columns: ["ID Kelas", "Nama Kelas", "Tipe Pembayaran", "Harga (Formatted)", "Harga (Numerik)", "Wajib Sertifikat", "Batas Nilai Quiz", "Memiliki Tugas", "Total Peserta", "Tanggal Mulai", "Tanggal Selesai", "Tanggal Dibuat"],
    previewRows: [
      ["KLS-101", "Dasar TypeScript", "Gratis", "Rp 0", "0", "Tidak", "-", "Ya", "142", "15 Jun 2026", "22 Jun 2026", "10 Jun 2026 10:00 WIB"],
      ["KLS-102", "Next.js Advanced App", "Berbayar", "Rp 350.000", "350000", "Ya", "80", "Ya", "85", "20 Jun 2026", "30 Jun 2026", "12 Jun 2026 15:30 WIB"],
    ],
  },
  {
    value: "bootcamp",
    label: "Pelatihan (Sesi/Batch)",
    desc: "Data kuota pelatihan/bootcamp, sesi berjalan, data batch, dan kapasitas maksimal.",
    icon: GraduationCap,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    bgColor: "bg-white",
    columns: ["ID Pelatihan", "Nama Pelatihan", "Batch", "Kategori", "Tipe Pembayaran", "Harga (Formatted)", "Harga (Numerik)", "Harga Coret (Formatted)", "Harga Coret (Numerik)", "Batas Nilai Quiz", "Kapasitas Maksimal", "Total Peserta", "Tanggal Mulai Jual", "Tanggal Tutup Daftar", "Tanggal Dibuat"],
    previewRows: [
      ["BC-201", "Fullstack Laravel Batch 1", "Batch 1", "Coding", "Berbayar", "Rp 999.000", "999000", "Rp 1.500.000", "1500000", "75", "50", "28", "01 Jun 2026", "15 Jun 2026", "25 May 2026 09:00 WIB"],
    ],
  },
  {
    value: "webinar",
    label: "Webinar",
    desc: "Laporan agenda webinar, jadwal, kuota tiket, dan link virtual meeting room.",
    icon: Video,
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    bgColor: "bg-white",
    columns: ["ID Webinar", "Nama Webinar", "Tipe Pembayaran", "Harga Tiket (Formatted)", "Harga Tiket (Numerik)", "Harga Coret (Formatted)", "Harga Coret (Numerik)", "Kapasitas Maksimal", "Total Pendaftar", "Waktu Mulai", "Waktu Selesai", "Link Virtual Room", "Zona Waktu", "Tanggal Dibuat"],
    previewRows: [
      ["WEB-301", "UI Design System Workshop", "Berbayar", "Rp 75.000", "75000", "Rp 150.000", "150000", "150", "98", "25 Jun 2026 14:00 WIB", "25 Jun 2026 16:30 WIB", "zoom.us/j/998877", "Asia/Jakarta", "12 Jun 2026 13:00 WIB"],
    ],
  },
  {
    value: "produk-digital",
    label: "Produk Digital",
    desc: "Ekspor e-book, file produk, total penjualan, data download, dan info file.",
    icon: BookOpen,
    color: "text-amber-600 bg-amber-50 border-amber-100",
    bgColor: "bg-white",
    columns: ["ID Produk", "Nama Produk", "Kategori", "Tipe Pembayaran", "Harga Jual (Formatted)", "Harga Jual (Numerik)", "Harga Coret (Formatted)", "Harga Coret (Numerik)", "Total Penjualan", "Sumber File", "Nama File/Tautan", "Penulis/Artis", "ISBN", "Bahasa", "Jumlah Halaman", "Bisa Didownload", "Tanggal Dibuat"],
    previewRows: [
      ["DIG-401", "Cheat Sheet Tailwind v4", "E-Book", "Gratis", "Rp 0", "0", "-", "0", "340", "Upload", "tailwind_v4.pdf", "Farhan", "-", "Indonesia", "15", "Ya", "14 Jun 2026 16:00 WIB"],
    ],
  },
  {
    value: "event",
    label: "Kegiatan/Acara",
    desc: "Ekspor data event luring/daring, lokasi acara, dan kapasitas tiket terdaftar.",
    icon: CalendarDays,
    color: "text-pink-600 bg-pink-50 border-pink-100",
    bgColor: "bg-white",
    columns: ["ID Event", "Nama Event", "Tipe", "Lokasi", "Harga Terendah (Formatted)", "Harga Terendah (Numerik)", "Waktu Mulai", "Waktu Selesai", "Batas Tiket Per Transaksi", "Bisa Affiliate", "Status", "Total Tiket Terdaftar", "Tanggal Dibuat"],
    previewRows: [
      ["EVT-501", "Developer Meetup Bandung", "Publik", "Dilo Bandung", "Rp 25.000", "25000", "10 Jul 2026 13:00 WIB", "10 Jul 2026 17:00 WIB", "2", "Ya", "Published", "120", "15 Jun 2026 10:00 WIB"],
    ],
  },
  {
    value: "payment-link",
    label: "Link Pembayaran",
    desc: "Tautan tagihan instan, slug custom, affiliate, dan status kadaluarsa.",
    icon: Link2,
    color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    bgColor: "bg-white",
    columns: ["ID Link", "Nama Tagihan", "Status", "Nominal Pembayaran (Formatted)", "Nominal Pembayaran (Numerik)", "Harga Coret (Formatted)", "Harga Coret (Numerik)", "Slug Tautan", "Maksimum Transaksi", "Dapat Affiliate", "Tanggal Kadaluarsa", "Tanggal Dibuat"],
    previewRows: [
      ["LNK-601", "Donasi Berbagi Sarapan", "Aktif", "Rp 15.000", "15000", "-", "0", "berbagi-sarapan", "Tak Terbatas", "Ya", "Tidak Ada", "10 Jun 2026 08:00 WIB"],
    ],
  },
  {
    value: "penggalangan-dana",
    label: "Penggalangan Dana",
    desc: "Data kampanye donasi, target pendanaan, sisa dana terkumpul, dan auto-close.",
    icon: Heart,
    color: "text-rose-600 bg-rose-50 border-rose-100",
    bgColor: "bg-white",
    columns: ["ID Kampanye", "Judul Kampanye", "Status", "Target Dana (Formatted)", "Target Dana (Numerik)", "Terkumpul (Formatted)", "Terkumpul (Numerik)", "Tutup Otomatis", "Bisa Affiliate", "Tanggal Dibuat"],
    previewRows: [
      ["DON-701", "Bantu Renovasi Sekolah", "Aktif", "Rp 50.000.000", "50000000", "Rp 12.500.000", "12500000", "Ya", "Tidak", "01 Jun 2026 09:00 WIB"],
    ],
  },
];

export default function EksporIndex({ counts = {} }: Props) {
  const [activePreview, setActivePreview] = useState("all");

  const selectedPreviewData =
    EXPORT_OPTIONS.find((opt) => opt.value === activePreview) || EXPORT_OPTIONS[0];

  const handleDownload = (value: string) => {
    window.open(`/pengaturan/ekspor?type=${value}`, "_blank");
  };

  return (
    <DashboardLayout title="Ekspor Laporan">
      <Head title="Ekspor Laporan & Data" />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Ekspor Laporan Data
            </h1>
            <p className="text-slate-500 text-sm">
              Unduh semua data produk dan histori transaksi Anda dengan struktur kolom yang rapi untuk dianalisis di Excel atau Google Sheets.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/80 border border-slate-200/50 rounded-xl px-3 py-1.5 shrink-0 self-start md:self-center">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Format output: UTF-8 CSV dengan BOM Excel</span>
          </div>
        </div>

        {/* Featured: All Products Export Card */}
        {EXPORT_OPTIONS.slice(0, 1).map((opt) => {
          const Icon = opt.icon;
          const count = counts[opt.value] || 0;
          return (
            <div
              key={opt.value}
              onClick={() => setActivePreview(opt.value)}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${
                activePreview === opt.value ? "ring-2 ring-blue-400 ring-offset-2" : ""
              }`}
            >
              <div className="absolute right-0 top-0 -mr-6 -mt-6 h-36 w-36 rounded-full bg-white/10 blur-2xl transition-all group-hover:scale-110" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge className="bg-white/20 hover:bg-white/20 text-white font-bold px-3 py-1 rounded-full border-none text-xs">
                      {count} Total Produk Tersedia
                    </Badge>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{opt.label}</h2>
                    <p className="text-blue-100 text-sm max-w-xl mt-1.5">
                      {opt.desc}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-blue-100/90 pt-1">
                    {opt.columns.slice(0, 6).map((col) => (
                      <span key={col} className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-md">
                        <Check className="h-3 w-3 text-blue-200" /> {col}
                      </span>
                    ))}
                    <span className="bg-white/15 px-2.5 py-1 rounded-md font-bold text-white">
                      +{opt.columns.length - 6} kolom lainnya
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 self-start md:self-center">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(opt.value);
                    }}
                    className="bg-white hover:bg-slate-50 text-blue-700 font-bold h-12 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Download className="h-5 w-5" />
                    Unduh Semua Data
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Categories Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Table className="h-5 w-5 text-slate-500" />
            Ekspor per Kategori Produk
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXPORT_OPTIONS.slice(1).map((opt) => {
              const Icon = opt.icon;
              const count = counts[opt.value] || 0;
              const isSelected = activePreview === opt.value;

              return (
                <Card
                  key={opt.value}
                  onClick={() => setActivePreview(opt.value)}
                  className={`group cursor-pointer border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 rounded-2xl overflow-hidden ${
                    isSelected ? "ring-2 ring-blue-500 border-transparent shadow-md" : ""
                  }`}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${opt.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="font-bold text-xs bg-slate-100 text-slate-600">
                        {count} data
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-800 font-bold text-base mt-3.5 group-hover:text-blue-600 transition-colors">
                      {opt.label}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-xs leading-relaxed min-h-[36px]">
                      {opt.desc}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-5 py-3 pt-0 border-t border-slate-50 mt-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Kolom Utama</p>
                    <div className="flex flex-wrap gap-1.5">
                      {opt.columns.slice(0, 4).map((col) => (
                        <span key={col} className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-2 py-0.5">
                          {col}
                        </span>
                      ))}
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50/50 rounded-md px-2 py-0.5">
                        +{opt.columns.length - 4} lagi
                      </span>
                    </div>
                  </CardContent>

                  <div className="p-5 pt-0 mt-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(opt.value);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Unduh CSV
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Live CSV Column Preview Panel */}
        <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Pratinjau Struktur Data: {selectedPreviewData.label}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Struktur kolom dan baris sampel yang akan diunduh pada kategori ini.
              </p>
            </div>
            <Button
              onClick={() => handleDownload(selectedPreviewData.value)}
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 self-start sm:self-center active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh CSV Sekarang
            </Button>
          </div>

          <div className="p-6 overflow-hidden">
            {/* Scrollable Table Wrapper */}
            <div className="border border-slate-150 rounded-xl overflow-x-auto bg-slate-50/30">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200">
                    {selectedPreviewData.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 font-bold text-slate-700 whitespace-nowrap border-r border-slate-200/70 last:border-r-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedPreviewData.previewRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-slate-100/70 hover:bg-slate-50 bg-white last:border-b-0"
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-4 py-3 font-medium whitespace-nowrap border-r border-slate-250/20 last:border-r-0 text-slate-500"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 font-medium">
              <Info className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Preview di atas adalah sampel representatif. Data unduhan asli akan menampilkan seluruh record di akun Anda secara lengkap.</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
