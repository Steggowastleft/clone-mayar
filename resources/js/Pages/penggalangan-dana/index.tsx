import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
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
  Heart,
  Clock,
  Globe,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───
type Produk = {
  id: number;
  tipe: "donasi" | "wakaf";
  nama: string;
  status: "published" | "unpublished" | "unlisted";
  tanggal_mulai_jual: string | null;
  tanggal_tutup: string | null;
  pembeli: number;
  terkumpul: number;
  harga: number;
  cover: string | null;
  created_at?: string;
};

type IndexProps = {
  produk?: Produk[];
};

// ─── DateTimePickerField ───
function DateTimePickerField({
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
  const [time, setTime] = useState("09:00");

  const handleSelect = (d: Date | undefined) => {
    if (!d) {
      onChange(undefined);
      setOpen(false);
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const combined = new Date(d);
    combined.setHours(h, m, 0, 0);
    onChange(combined);
    setOpen(false);
  };

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
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
            {value
              ? format(value, "dd MMMM yyyy HH:mm", { locale: idLocale })
              : "Pilih tanggal & waktu..."}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[200]" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="p-3 border-t flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1 flex-1"
            />
          </div>
          {value && optional && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                Hapus tanggal
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Default form values ───
const defaultForm = {
  tipe: "donasi" as "donasi" | "wakaf",
  nama: "",
  deskripsi: "",
  kategori: "",
  harga: "",
  minimal_donasi: "",
  tujuan: "",
  penerima_manfaat: "",
  rincian_penggunaan: "",
  catatan: "",
  redirect_url: "",
  tampilkan_target: true,
  tampilkan_pencairan: false,
};

const kategoriBentukDonasi = [
  "Bencana Alam",
  "Kesehatan",
  "Pendidikan",
  "Kemanusiaan",
  "Agama",
  "Lainnya",
];

// ─── Main ───
export default function Index({ produk = [] }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tanggalMulaiJual, setTanggalMulaiJual] = useState<Date | undefined>();
  const [tanggalTutup, setTanggalTutup] = useState<Date | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setTanggalMulaiJual(undefined);
    setTanggalTutup(undefined);
    setCreateOpen(true);
  };


  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "unpublished":
        return <Badge className="bg-yellow-500 text-white">Unpublished</Badge>;
      case "unlisted":
        return <Badge className="bg-gray-500 text-white">Unlisted</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const tipeBadge = (tipe: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      donasi: { label: "Donasi", color: "bg-blue-500" },
      wakaf: { label: "Wakaf", color: "bg-green-600" },
    };
    const config = badges[tipe] || badges["donasi"];
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const statusButtons = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
    { label: "UNLISTED", value: "unlisted" },
  ];

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
    if (!formData.nama.trim()) return alert("Nama tidak boleh kosong");
    if (!formData.harga || Number(formData.harga) <= 0)
      return alert("Harga/Target harus diisi dan lebih dari 0");

    // Validasi tipe-spesifik
    if (formData.tipe === "donasi" && !formData.kategori)
      return alert("Kategori donasi harus dipilih");

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("tipe", formData.tipe);
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("redirect_url", formData.redirect_url);
    payload.append("catatan", formData.catatan);

    if (tanggalMulaiJual)
      payload.append(
        "tanggal_mulai_jual",
        format(tanggalMulaiJual, "yyyy-MM-dd HH:mm:ss")
      );
    if (tanggalTutup)
      payload.append("tanggal_tutup", format(tanggalTutup, "yyyy-MM-dd HH:mm:ss"));

    // Tipe-spesifik fields
    if (formData.tipe === "donasi") {
      payload.append("kategori", formData.kategori);
      payload.append("harga", formData.harga);
      payload.append("minimal_donasi", formData.minimal_donasi);
      payload.append("tujuan", formData.tujuan);
      payload.append("penerima_manfaat", formData.penerima_manfaat);
      payload.append("rincian_penggunaan", formData.rincian_penggunaan);
      payload.append("tampilkan_target", formData.tampilkan_target ? "1" : "0");
      payload.append(
        "tampilkan_pencairan",
        formData.tampilkan_pencairan ? "1" : "0"
      );
    } else if (formData.tipe === "wakaf") {
      payload.append("harga", formData.harga);
      payload.append("tujuan", formData.tujuan);
      payload.append("penerima_manfaat", formData.penerima_manfaat);
      payload.append("rincian_penggunaan", formData.rincian_penggunaan);
      payload.append("tampilkan_target", formData.tampilkan_target ? "1" : "0");
    }

    if (coverFile) payload.append("cover", coverFile);

    router.post("/penggalangan-dana", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  const totalProduk = (produk ?? []).length;
  const publikCount = (produk ?? []).filter((p) => p.status === "published").length;
  const tidakPublikCount = totalProduk - publikCount;
  const totalPendapatan = (produk ?? []).reduce((acc, p) => acc + p.terkumpul, 0);

  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const filteredProduk = (produk ?? []).filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchTipe = tipeFilter === "all" || p.tipe === tipeFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    let matchDate = true;
    if (dateFilter) {
      const formattedFilterDate = format(dateFilter, "yyyy-MM-dd");
      matchDate = p.created_at ? p.created_at.startsWith(formattedFilterDate) : (p.tanggal_mulai_jual ? p.tanggal_mulai_jual.startsWith(formattedFilterDate) : false);
    }
    return matchStatus && matchTipe && matchSearch && matchDate;
  });

  return (
    <DashboardLayout title="Penggalangan Dana">
      <Head title="Penggalangan Dana" />
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Penggalangan Dana</h1>
            <div className="flex items-center gap-6 mt-3 text-sm text-slate-500 font-medium flex-wrap">
              <div className="flex items-center gap-2">
                <span>Total Projek: <span className="font-bold text-slate-800">{totalProduk}</span></span>
                <span className="bg-red-50 text-red-655 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{tidakPublikCount} Tidak Publik
                </span>
                <span className="bg-green-50 text-green-655 border border-green-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +{publikCount} Publik
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Total Dana Terkumpul: <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat("id-ID").format(totalPendapatan)}</span></span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/penggalangan-dana/catalog", "_blank")}
            >
              Katalog Publik
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={openCreate}
            >
              + Tambah Projek
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
              placeholder="Cari Nama Projek..."
              className="pl-9 bg-slate-50/50 border-slate-250 rounded-lg text-sm w-full focus:bg-white transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3.5 flex-wrap">
            {/* Tipe Select */}
            <Select value={tipeFilter} onValueChange={setTipeFilter}>
              <SelectTrigger className="w-40 bg-white border-slate-250 rounded-lg text-xs font-semibold text-slate-600">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="donasi">Donasi</SelectItem>
                <SelectItem value="wakaf">Wakaf</SelectItem>
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
            <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
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
                    setDateFilterOpen(false);
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
                        setDateFilterOpen(false);
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
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">No</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tampilan</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipe</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Projek</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Donatur</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terkumpul</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dibuat</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredProduk.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredProduk.map((p, index) => {
                    const statusIsPublik = p.status === "published";
                    const formattedDate = p.created_at ? format(new Date(p.created_at), "dd MMM yyyy", { locale: idLocale }) : "-";
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {p.cover ? (
                            <img
                              src={`/storage/${p.cover}`}
                              alt={p.nama}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-slate-655 capitalize">
                          {p.tipe}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[200px] truncate">
                          {p.nama}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-655 font-semibold whitespace-nowrap">
                          Rp {new Intl.NumberFormat("id-ID").format(p.harga)}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{p.pembeli}</td>
                        <td className="px-5 py-5 text-sm text-slate-800 font-bold whitespace-nowrap">
                          Rp {new Intl.NumberFormat("id-ID").format(p.terkumpul)}
                        </td>
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
                            onClick={() => router.visit(`/penggalangan-dana/${p.id}`)}
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

      {/* ── CREATE DIALOG ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Penggalangan Dana Baru
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Buat penggalangan dana (Donasi atau Wakaf) dengan mudah
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Tipe Penggalangan Dana */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Tipe Penggalangan Dana <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipe}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    tipe: v as "donasi" | "wakaf",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe..." />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="donasi">Donasi</SelectItem>
                  <SelectItem value="wakaf">Wakaf</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kategori (untuk Donasi) */}
            {formData.tipe === "donasi" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Kategori Penggalangan Dana{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(v) =>
                    setFormData({ ...formData, kategori: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori..." />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {kategoriBentukDonasi.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Nama */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Judul Penggalangan Dana
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={
                  formData.tipe === "donasi"
                    ? "Contoh: Bantu Warga Pengungsi Bencana Alam"
                    : "Contoh: Wakaf Pembangunan Masjid"
                }
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Deskripsi <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Deskripsi singkat tentang penggalangan dana ini"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>

            {/* Harga / Target */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Target <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-gray-600 font-medium">
                  Rp
                </span>
                <Input
                  className="pl-10"
                  type="number"
                  placeholder="0"
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-gray-400">
                {formData.tipe === "donasi"
                  ? "Donasi menggunakan mata uang IDR(Rp)"
                  : "Wakaf menggunakan mata uang IDR(Rp)"}
              </p>
            </div>

            {/* Minimal Donasi (untuk Donasi) */}
            {formData.tipe === "donasi" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Minimal Donasi{" "}
                  <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-600 font-medium">
                    Rp
                  </span>
                  <Input
                    className="pl-10"
                    type="number"
                    placeholder="0"
                    value={formData.minimal_donasi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimal_donasi: e.target.value,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-gray-400">
                  dalam mata uang IDR (Rupiah), kosongkan jika tidak ada minimal
                </p>
              </div>
            )}


            {/* Tujuan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Tujuan
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                placeholder={
                  formData.tipe === "donasi"
                    ? "Contoh: Membantu pengungsi bencana alam yang kekurangan makanan"
                    : "Contoh: Membantu biaya pembangunan Masjid"
                }
                value={formData.tujuan}
                onChange={(e) =>
                  setFormData({ ...formData, tujuan: e.target.value })
                }
              />
            </div>

            {/* Penerima Manfaat */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Penerima Manfaat
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                placeholder="Contoh: Pak Abunawas dan Keluarganya"
                value={formData.penerima_manfaat}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    penerima_manfaat: e.target.value,
                  })
                }
              />
            </div>

            {/* Cerita / Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Cerita / Deskripsi
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder={
                  formData.tipe === "donasi"
                    ? "Ceritakan mengenai tujuan penggalangan dana, rencana penggunaan dana, dll (Lihat Contoh)"
                    : "Ceritakan mengenai tujuan wakaf, rencana penggunaan dana, dll"
                }
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                className="min-h-[120px]"
              />
            </div>

            {/* Rincian Penggunaan Dana */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Rincian Penggunaan Dana Jika Terkumpul
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Tulis sedetail mungkin. Contoh: Pembelian material bangunan, pembayaran tukang, dll"
                value={formData.rincian_penggunaan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rincian_penggunaan: e.target.value,
                  })
                }
                className="min-h-[100px]"
              />
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Cover (gambar/video untuk promo){" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              >
                {coverPreview ? (
                  <div>
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="max-h-32 mx-auto mb-2 rounded"
                    />
                    <p className="text-xs text-gray-500">Klik untuk ubah gambar</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Drag & drop image atau klik untuk upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP | Max 5MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Waktu Mulai Penjualan / terima donasi"
                value={tanggalMulaiJual}
                onChange={setTanggalMulaiJual}
                optional
              />
              <DateTimePickerField
                label="Batas Waktu"
                value={tanggalTutup}
                onChange={setTanggalTutup}
                optional
              />
            </div>

            <p className="text-xs text-gray-400 -mt-3">
              Kami akan membuka link pembayaran pada tanggal dan waktu yang anda
              pilih. Opsional, kosongkan untuk langsung membuka penjualan
            </p>

            {/* Catatan */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Catatan{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Textarea
                placeholder="Catatan akan dilihat oleh pembeli/donatur setelah melakukan pembayaran"
                value={formData.catatan}
                onChange={(e) =>
                  setFormData({ ...formData, catatan: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Redirect URL{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  type="url"
                  placeholder="https://websiteanda.com/terimakasih"
                  value={formData.redirect_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      redirect_url: e.target.value,
                    })
                  }
                />
              </div>
              <p className="text-xs text-gray-400">
                Donatur akan dibawa kehalaman ini setelah membayar (opsional /
                bisa dikosongkan)
              </p>
            </div>

            {/* Options */}
            {(formData.tipe === "donasi" || formData.tipe === "wakaf") && (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <Label className="text-sm font-medium text-gray-700">Opsi</Label>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">
                    Tampilkan Target {formData.tipe === "wakaf" ? "Wakaf" : "Donasi"}
                  </label>
                  <Switch
                    checked={formData.tampilkan_target}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, tampilkan_target: v })
                    }
                  />
                </div>
                {formData.tipe === "donasi" && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">
                      Tampilkan Pencairan Dana Donasi
                    </label>
                    <Switch
                      checked={formData.tampilkan_pencairan}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, tampilkan_pencairan: v })
                      }
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-lg sticky bottom-0 z-10">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
