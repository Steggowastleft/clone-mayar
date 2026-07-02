import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router, useForm } from "@inertiajs/react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarIcon,
  Printer,
  Download,
  ExternalLink,
  Upload,
  GraduationCap,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type Bootcamp = {
  id: number;
  name: string;
  batch: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  participants: number;
  kategori?: string | null;
  harga?: number;
  tipe_pembayaran?: string | null;
  cover_url?: string | null;
  created_at?: string | null;
};

type IndexProps = {
  bootcamps: Bootcamp[];
  totalRevenue?: number;
  revenueGrowthText?: string;
};

// ─── DatePickerField ───
function DatePickerField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  optional?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <Label>
        {label}{" "}
        {optional && <span className="text-gray-400 font-normal">(Opsional)</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left hover:border-gray-300 transition",
              value ? "text-gray-800" : "text-gray-400"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
            {value ? format(value, "dd MMMM yyyy", { locale: idLocale }) : "Pilih tanggal..."}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[200]" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); setOpen(false); }}
            initialFocus
          />
          {value && optional && (
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500"
                onClick={() => { onChange(undefined); setOpen(false); }}>
                Hapus tanggal
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

// ─── Default form values ───
const defaultForm = {
  judul: "",
  kategori: "",
  tipePembayaran: "",
  harga: "",
  hargaCoret: "",
  deskripsi: "",
  instruksi: "",
  syaratKetentuan: "",
  maxPeserta: "",
  batasNilaiQuiz: "",
  redirectUrl: "",
};

// ─── Main ───
export default function Index({ bootcamps, totalRevenue, revenueGrowthText }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [kategoriFilter, setKategoriFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [rangePenjualan, setRangePenjualan] = useState<DateRange | undefined>();
  const [rangePembelajaran, setRangePembelajaran] = useState<DateRange | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form setiap kali dialog dibuka
  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setRangePenjualan(undefined);
    setRangePembelajaran(undefined);
    setCreateOpen(true);
  };

  const filteredBootcamps = bootcamps.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchKategori = kategoriFilter === "all" || b.kategori === kategoriFilter;
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    let matchDate = true;
    if (dateFilter) {
      const formattedFilterDate = format(dateFilter, "yyyy-MM-dd");
      matchDate = b.created_at ? b.created_at.startsWith(formattedFilterDate) : (b.date ? b.date.startsWith(formattedFilterDate) : false);
    }
    return matchStatus && matchKategori && matchSearch && matchDate;
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.judul.trim()) return alert("Judul tidak boleh kosong");
    setIsSubmitting(true);

    // Kirim ke backend via Inertia
    const payload = new FormData();
    payload.append("judul", formData.judul);
    payload.append("kategori", formData.kategori);
    payload.append("tipePembayaran", formData.tipePembayaran);
    payload.append("harga", formData.harga);
    payload.append("hargaCoret", formData.hargaCoret);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("instruksi", formData.instruksi);
    payload.append("syaratKetentuan", formData.syaratKetentuan);
    payload.append("maxPeserta", formData.maxPeserta);
    payload.append("batasNilaiQuiz", formData.batasNilaiQuiz);
    payload.append("redirectUrl", formData.redirectUrl);
    if (rangePenjualan?.from)
      payload.append("tanggalMulaiJual", format(rangePenjualan.from, "yyyy-MM-dd"));

    if (rangePenjualan?.to)
      payload.append("tanggalTutupDaftar", format(rangePenjualan.to, "yyyy-MM-dd"));

    if (rangePembelajaran?.from)
      payload.append("tanggalMulaiPembelajaran", format(rangePembelajaran.from, "yyyy-MM-dd"));

    if (rangePembelajaran?.to)
      payload.append("tanggalBatasPembelajaran", format(rangePembelajaran.to, "yyyy-MM-dd"));
    if (coverFile) payload.append("cover", coverFile);

    router.post("/bootcamps", payload, {
      forceFormData: true,
      onSuccess: (page) => {
        setCreateOpen(false);
        setIsSubmitting(false);
        router.reload();
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const kategoriOptions = [
    "Teknologi & Pemrograman", "Desain & Kreatif", "Bisnis & Kewirausahaan",
    "Pemasaran Digital", "Data Science & AI", "Bahasa & Komunikasi",
    "Keuangan & Akuntansi", "Kesehatan & Kebugaran", "Pendidikan & Pengajaran", "Lainnya",
  ];

  const totalBootcamps = bootcamps.length;
  const aktifCount = bootcamps.filter((b) => b.status === "published").length;
  const unlistedCount = bootcamps.filter((b) => b.status === "unlisted").length;
  const tidakAktifCount = totalBootcamps - aktifCount - unlistedCount;
  const localPendapatan = bootcamps.reduce((acc, b) => acc + (b.participants || 0) * (b.harga || 0), 0);
  const displayRevenue = totalRevenue !== undefined ? totalRevenue : localPendapatan;
  const growthText = revenueGrowthText || "+0% Dari bulan kemarin";

  return (
    <DashboardLayout title="Pelatihan (Sesi/Batch)">
      <Head title="Pelatihan (Sesi/Batch)" />
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pelatihan (Sesi/Batch)</h1>
            <div className="flex flex-col gap-2 mt-3">
              {/* Baris 1: Status Produk */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Pelatihan: <span className="font-bold text-slate-800">{totalBootcamps}</span></span>
                <span className="bg-green-50 text-green-655 border border-green-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{aktifCount} Aktif
                </span>
                <span className="bg-red-50 text-red-655 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{tidakAktifCount} Tidak Aktif
                </span>
                <span className="bg-blue-50 text-blue-655 border border-blue-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{unlistedCount} Tidak Terdaftar (Unlisted)
                </span>
              </div>
              {/* Baris 2: Pendapatan */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Pendapatan: <span className="font-bold text-slate-800">Rp. {new Intl.NumberFormat("id-ID").format(displayRevenue)}</span></span>
                <span className="bg-emerald-50 text-emerald-655 border border-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {growthText}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/bootcamps/katalog", "_blank")}
            >
              Katalog Publik
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={openCreate}
            >
              + Buat Pelatihan
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-3 bg-white p-4 border border-slate-200/85 rounded-xl shadow-sm flex-wrap">
          {/* Left Search */}
          <div className="relative w-72 max-w-full">
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Cari Nama Bootcamp..."
              className="pl-9 bg-slate-50/50 border-slate-250 rounded-lg text-sm w-full focus:bg-white transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Kategori Select */}
            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className="w-48 bg-white border-slate-250 rounded-lg text-xs font-semibold text-slate-600">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Kategori</SelectItem>
                {kategoriOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Select */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white border-slate-250 rounded-lg text-xs font-semibold text-slate-600">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Publik</SelectItem>
                <SelectItem value="unpublished">Tidak Publik (Unpublished)</SelectItem>
                <SelectItem value="unlisted">Tidak Publik (Unlisted)</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border border-slate-250 rounded-lg bg-white text-xs font-semibold hover:border-slate-350 transition text-slate-600",
                    dateFilter && "text-slate-800 border-slate-450"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-slate-455 shrink-0" />
                  {dateFilter
                    ? format(dateFilter, "dd MMM yyyy", { locale: idLocale })
                    : "Pilih Tanggal"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[200]" align="end">
                <Calendar
                  mode="single"
                  selected={dateFilter}
                  onSelect={(d) => {
                    setDateFilter(d);
                    setDateOpen(false);
                  }}
                  initialFocus
                />
                {dateFilter && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-slate-500"
                      onClick={() => {
                        setDateFilter(undefined);
                        setDateOpen(false);
                      }}
                    >
                      Hapus filter tanggal
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-blue-50/80">
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">No</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tampilan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Batch</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Pelatihan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mulai Jual</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredBootcamps.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredBootcamps.map((b, index) => {
                    const statusIsPublik = b.status === "published";
                    const formattedDate = b.date ? format(new Date(b.date), "dd MMM yyyy", { locale: idLocale }) : "-";
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {b.cover_url ? (
                            <img
                              src={b.cover_url}
                              alt={b.name}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-slate-655 whitespace-nowrap">
                          {b.batch || "Batch 1"}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[200px] truncate">
                          {b.name}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-655 font-semibold select-all max-w-[150px] truncate">
                          {b.kategori || "-"}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-800 font-bold whitespace-nowrap">
                          {b.harga && b.harga > 0 ? `Rp ${new Intl.NumberFormat("id-ID").format(b.harga)}` : "Gratis"}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{b.participants || 0}</td>
                        <td className="px-5 py-5">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                              statusIsPublik
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-755 border-red-200"
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", statusIsPublik ? "bg-green-500" : "bg-red-500")} />
                            {statusIsPublik ? "Publik" : "Tidak Publik"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-xs text-slate-450 font-semibold whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="px-5 py-5 text-right whitespace-nowrap">
                          <button
                            onClick={() => router.visit(`/bootcamps/${b.id}`)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 underline transition"
                          >
                            Lihat
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-white border-b border-slate-100 p-6 rounded-t-lg sticky top-0 z-10 flex items-center justify-between">
            <DialogTitle className="text-slate-900 text-xl font-bold">
              Buat Kelas Cohort / Bootcamp
            </DialogTitle>
          </div>

          <div className="p-6 space-y-5">
            {/* Judul */}
            <div className="space-y-1">
              <Label>Judul / Nama Bootcamp <span className="text-red-500">*</span></Label>
              <Input placeholder="Contoh: Web Development Bootcamp Batch 5"
                value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} />
            </div>

            {/* Kategori */}
            <div className="space-y-1">
              <Label>Kategori <span className="text-red-500">*</span></Label>
              <Select value={formData.kategori} onValueChange={(v) => setFormData({ ...formData, kategori: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori bootcamp..." /></SelectTrigger>
                <SelectContent className="z-[200]">
                  {kategoriOptions.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Tipe Pembayaran */}
            <div className="space-y-1">
              <Label>Tipe Pembayaran <span className="text-red-500">*</span></Label>
              <Select value={formData.tipePembayaran} onValueChange={(v) => setFormData({ ...formData, tipePembayaran: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih tipe pembayaran..." /></SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="berbayar">Produk Berbayar</SelectItem>
                  <SelectItem value="gratis">Produk Gratis</SelectItem>
                  <SelectItem value="bayar_semaunya">Produk Bayar Semaunya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipePembayaran !== "gratis" && (
              <>
                {/* Harga */}
                <div className="space-y-1">
                  <Label>Harga (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      placeholder="0"
                      type="text"
                      value={formData.harga ? formatRupiahInput(formData.harga) : ""}
                      onChange={(e) =>
                        setFormData({ ...formData, harga: e.target.value.replace(/\D/g, "") })
                      }
                    />
                  </div>
                </div>

                {/* Harga Coret */}
                <div className="space-y-1">
                  <Label>
                    Harga Coret (Rp){" "}
                    <span className="text-gray-400 font-normal">(Opsional)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      placeholder="Harus lebih besar dari harga awal"
                      type="text"
                      value={formData.hargaCoret ? formatRupiahInput(formData.hargaCoret) : ""}
                      onChange={(e) =>
                        setFormData({ ...formData, hargaCoret: e.target.value.replace(/\D/g, "") })
                      }
                    />
                  </div>

                  {formData.harga &&
                    formData.hargaCoret &&
                    Number(formData.hargaCoret) <= Number(formData.harga) && (
                      <p className="text-xs text-red-500">
                        Harga coret harus lebih besar dari harga awal
                      </p>
                    )}
                </div>
              </>
            )}

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Tuliskan deskripsi bootcamp kamu..." rows={4}
                value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} />
            </div>

            {/* Cover */}
            <div className="space-y-2">
              <Label>Cover Gambar</Label>
              <div
                className="border border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition flex flex-col items-center justify-center min-h-[140px]"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
                ) : (
                  <div className="flex items-center gap-3 justify-center">
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#eef2f6] text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
                    >
                      Select image...
                    </button>
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-slate-400" />
                      Drop image here
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverFile && <p className="text-xs text-green-600">✓ {coverFile.name}</p>}
            </div>

            {/* Instruksi */}
            <div className="space-y-1">
              <Label>Instruksi</Label>
              <p className="text-xs text-gray-500 leading-relaxed">
                Instruksi adalah catatan yang akan dilihat oleh pendaftar setelah melakukan pendaftaran/membayar.
                Anda bisa memasukkan instruksi masuk ke zoom, passwordnya, link gabung grup WA, formulir google, kontak cs dll disini.
              </p>
              <Textarea placeholder="Contoh: Silakan bergabung ke grup WhatsApp melalui link berikut..." rows={3}
                value={formData.instruksi} onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })} />
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-1">
              <Label>Syarat & Ketentuan</Label>
              <Textarea placeholder="Tuliskan syarat dan ketentuan bootcamp..." rows={3}
                value={formData.syaratKetentuan} onChange={(e) => setFormData({ ...formData, syaratKetentuan: e.target.value })} />
            </div>

           {/* Dates */}
            <div className="space-y-4">

              {/* Penjualan */}
              <div className="space-y-1">
                <Label>
                  Periode Penjualan
                </Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full px-3 py-2 border border-gray-200 rounded-md text-left text-sm hover:border-gray-300 transition">
                      {rangePenjualan?.from && rangePenjualan?.to
                        ? `${format(rangePenjualan.from, "dd MMM yyyy")} - ${format(rangePenjualan.to, "dd MMM yyyy")}`
                        : "Pilih periode penjualan..."}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 z-[200]" align="start">
                    <Calendar
                      mode="range"
                      selected={rangePenjualan}
                      onSelect={setRangePenjualan}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Pembelajaran */}
              <div className="space-y-1">
                <Label>
                  Periode Pembelajaran
                </Label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full px-3 py-2 border border-gray-200 rounded-md text-left text-sm hover:border-gray-300 transition">
                      {rangePembelajaran?.from && rangePembelajaran?.to
                        ? `${format(rangePembelajaran.from, "dd MMM yyyy")} - ${format(rangePembelajaran.to, "dd MMM yyyy")}`
                        : "Pilih periode pembelajaran..."}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0 z-[200]" align="start">
                    <Calendar
                      mode="range"
                      selected={rangePembelajaran}
                      onSelect={setRangePembelajaran}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

            </div>

            {/* Max Peserta */}
            <div className="space-y-1">
              <Label>Jumlah Maksimum Peserta</Label>
              <Input type="number" placeholder="Kosongkan untuk unlimited"
                value={formData.maxPeserta} onChange={(e) => setFormData({ ...formData, maxPeserta: e.target.value })} />
              <p className="text-xs text-gray-400">Kami akan menutup pendaftaran setelah melewati batas jumlah maksimal. Kosongkan untuk tanpa limit jumlah (unlimited).</p>
            </div>

            {/* Batas Nilai Quiz */}
            <div className="space-y-1">
              <Label>Batas Nilai Quiz untuk Sertifikat</Label>
              <Input type="number" placeholder="Kosongkan jika tidak dibatasi nilai" min={0} max={100}
                value={formData.batasNilaiQuiz} onChange={(e) => setFormData({ ...formData, batasNilaiQuiz: e.target.value })} />
              <p className="text-xs text-gray-400">Kami akan menutup akses sertifikat sebelum customer mencapai batas minimal nilai rata-rata quiz. Kosongkan jika akses sertifikat tidak dibatasi nilai rata-rata quiz.</p>
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label>Redirect URL <span className="text-gray-400 font-normal">(Opsional)</span></Label>
              <Input type="url" placeholder="https://example.com/thank-you"
                value={formData.redirectUrl} onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })} />
              <p className="text-xs text-gray-400">Pelanggan akan dibawa ke halaman ini setelah membayar (opsional / bisa dikosongkan).</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center pt-4">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg text-sm transition shadow-sm w-full md:w-auto min-w-[180px]"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}