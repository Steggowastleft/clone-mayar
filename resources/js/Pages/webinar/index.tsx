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
  Video,
  Clock,
  Globe,
  Package,
  Minus,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types (sesuai migration) ───
type Webinar = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  peserta: number;
  max_peserta: number | null;
  harga: number;
  url: string | null;
  cover_url?: string | null;
  created_at?: string | null;
};

type IndexProps = {
  webinars: Webinar[];
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
    if (!d) { onChange(undefined); setOpen(false); return; }
    const [h, m] = time.split(":").map(Number);
    const combined = new Date(d);
    combined.setHours(h, m, 0, 0);
    onChange(combined);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}{" "}
        {optional && <span className="text-gray-400 font-normal">(opsional)</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-between gap-2 px-3.5 h-10 rounded-lg bg-[#eaedf0] text-sm text-left transition-all hover:bg-slate-200/70",
              value ? "text-slate-800" : "text-slate-450"
            )}
          >
            <span className="truncate">
              {value
                ? format(value, "dd MMMM yyyy HH:mm", { locale: idLocale })
                : "Pilih tanggal & waktu..."}
            </span>
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-450" />
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
                onClick={() => { onChange(undefined); setOpen(false); }}
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
  nama: "",
  deskripsi: "",
  url: "",
  harga: "",
  harga_coret: "",
  instruksi: "",
  syarat_ketentuan: "",
  max_peserta: "",
  redirect_url: "",
  timezone: "Asia/Jakarta",
};

const timezoneOptions = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
];

// ─── Main ───
export default function Index({ webinars = [] }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tanggalMulai, setTanggalMulai] = useState<Date | undefined>();
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | undefined>();
  const [tanggalMulaiJual, setTanggalMulaiJual] = useState<Date | undefined>();
  const [tanggalTutupDaftar, setTanggalTutupDaftar] = useState<Date | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setTanggalMulai(undefined);
    setTanggalSelesai(undefined);
    setTanggalMulaiJual(undefined);
    setTanggalTutupDaftar(undefined);
    setCreateOpen(true);
  };

  const filteredWebinars = (webinars ?? []).filter((w) => {
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase());
    let matchDate = true;
    if (dateFilter) {
      const formattedFilterDate = format(dateFilter, "yyyy-MM-dd");
      matchDate = w.created_at ? w.created_at.startsWith(formattedFilterDate) : (w.tanggal_mulai ? w.tanggal_mulai.startsWith(formattedFilterDate) : false);
    }
    return matchStatus && matchSearch && matchDate;
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
    if (!formData.nama.trim()) return alert("Nama webinar tidak boleh kosong");
    if (!tanggalMulai) return alert("Tanggal mulai harus diisi");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("url", formData.url);
    payload.append("harga", formData.harga || "0");
    payload.append("harga_coret", formData.harga_coret);
    payload.append("instruksi", formData.instruksi);
    payload.append("syarat_ketentuan", formData.syarat_ketentuan);
    payload.append("max_peserta", formData.max_peserta);
    payload.append("redirect_url", formData.redirect_url);
    payload.append("timezone", formData.timezone);

    if (tanggalMulai) payload.append("tanggal_mulai", format(tanggalMulai, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalSelesai) payload.append("tanggal_selesai", format(tanggalSelesai, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalMulaiJual) payload.append("tanggal_mulai_jual", format(tanggalMulaiJual, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalTutupDaftar) payload.append("tanggal_tutup_daftar", format(tanggalTutupDaftar, "yyyy-MM-dd HH:mm:ss"));
    if (coverFile) payload.append("cover", coverFile);

    router.post("/webinars", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
        router.reload();
      },
      onError: () => { setIsSubmitting(false); },
    });
  };

  const [pricingType, setPricingType] = useState<"free" | "paid" | "donation">("free");

  const totalWebinars = webinars.length;
  const aktifCount = webinars.filter((w) => w.status === "published").length;
  const unlistedCount = webinars.filter((w) => w.status === "unlisted").length;
  const tidakAktifCount = totalWebinars - aktifCount - unlistedCount;
  const totalPendapatan = webinars.reduce((acc, w) => acc + (w.peserta || 0) * (w.harga || 0), 0);

  return (
    <DashboardLayout title="Webinar">
      <Head title="Webinar" />
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Webinar</h1>
            <div className="flex items-center gap-6 mt-3 text-sm text-slate-500 font-medium flex-wrap">
              {/* Baris 1: Status Produk */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Webinar: <span className="font-bold text-slate-800">{totalWebinars}</span></span>
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
                <span>Total Pendapatan: <span className="font-bold text-slate-800">Rp. {new Intl.NumberFormat("id-ID").format(totalPendapatan)}</span></span>
                <span className="bg-emerald-50 text-emerald-655 border border-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +8% Dari bulan kemarin
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/webinars/catalog", "_blank")}
            >
              Katalog Publik
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-sm font-semibold flex items-center gap-1.5"
              onClick={() => window.open("/pengaturan/ekspor?type=webinar", "_blank")}
            >
              <Download className="h-4 w-4" /> Ekspor Data
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={openCreate}
            >
              + Buat Webinar
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
              placeholder="Cari Nama Webinar..."
              className="pl-9 bg-slate-50/50 border-slate-250 rounded-lg text-sm w-full focus:bg-white transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3.5 flex-wrap">
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
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Webinar</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredWebinars.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredWebinars.map((w, index) => {
                    const statusIsPublik = w.status === "published";
                    const formattedCreatedDate = w.created_at ? format(new Date(w.created_at), "dd MMM yyyy", { locale: idLocale }) : "-";
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {w.cover_url ? (
                            <img
                              src={w.cover_url}
                              alt={w.nama}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[250px] truncate">
                          {w.nama}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-800 font-bold whitespace-nowrap">
                          {w.harga === 0 ? "Gratis" : `Rp ${new Intl.NumberFormat("id-ID").format(w.harga)}`}
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
                        <td className="px-5 py-5 text-xs text-slate-455 font-semibold whitespace-nowrap">
                          {formattedCreatedDate}
                        </td>
                        <td className="px-5 py-5 text-center whitespace-nowrap">
                          <button
                            onClick={() => router.visit(`/webinars/${w.id}`)}
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
          <div className="bg-white border-b border-slate-100 p-6 rounded-t-lg sticky top-0 z-10 flex items-center justify-between">
            <DialogTitle className="text-slate-900 text-xl font-bold">
              Buat Webinar Baru
            </DialogTitle>
          </div>

          <div className="p-6 space-y-5">

            {/* Nama */}
            <div className="space-y-1">
              <Label>
                Nama Webinar <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Webinar Digital Marketing 2025"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* URL Webinar */}
            <div className="space-y-1">
              <Label>
                URL Webinar <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-9"
                  type="url"
                  placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-400">Link Zoom, Google Meet, atau YouTube Live untuk webinar ini.</p>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Tanggal & Waktu Mulai"
                value={tanggalMulai}
                onChange={setTanggalMulai}
              />
              <DateTimePickerField
                label="Tanggal & Waktu Selesai"
                value={tanggalSelesai}
                onChange={setTanggalSelesai}
                optional
              />
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Input
                value="WIB (GMT+07:00) - Asia/Jakarta"
                disabled
                className="bg-slate-50 border-slate-200 text-xs font-semibold text-slate-500 cursor-not-allowed h-10"
              />
              <p className="text-[10px] text-gray-400">Timezone disamaratakan menggunakan WIB untuk seluruh webinar.</p>
            </div>

            <div className="space-y-1">
              <Label>Tipe Harga</Label>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as any)}
              >
                <option value="free">Gratis</option>
                <option value="paid">Berbayar</option>
                <option value="donation">Bayar Seikhlasnya</option>
              </select>
            </div>

            {pricingType === "paid" && (
              <>
                {/* Harga */}
                <div className="space-y-1">
                  <Label>Harga (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="number"
                      min={0}
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                    />
                  </div>
                </div>

                {/* Harga Coret */}
                <div className="space-y-1">
                  <Label>
                    Harga Coret (Rp) <span className="text-gray-400">(Opsional)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                    <Input
                      className="pl-9"
                      type="number"
                      min={0}
                      value={formData.harga_coret}
                      onChange={(e) => setFormData({ ...formData, harga_coret: e.target.value })}
                    />
                  </div>

                  {formData.harga && formData.harga_coret &&
                    Number(formData.harga_coret) <= Number(formData.harga) && (
                      <p className="text-xs text-red-500">
                        Harga coret harus lebih besar dari harga awal
                      </p>
                    )}
                </div>
              </>
            )}
            {pricingType === "free" && (
              <p className="text-sm text-gray-500">Event ini gratis.</p>
            )}
            {pricingType === "donation" && (
              <div className="space-y-1">
                <Label>
                  Minimum Bayar (Opsional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                  <Input
                    className="pl-9"
                    type="number"
                    min={0}
                    placeholder="Kosongkan kalau bebas"
                    value={formData.harga}
                    onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  User nanti bebas isi nominal saat checkout
                </p>
              </div>
            )}

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Tuliskan deskripsi webinar kamu..."
                rows={4}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
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
                      <ImageIcon className="h-4 w-4 text-slate-400" />
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

            {/* Sales Control */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Mulai Tanggal Penjualan"
                value={tanggalMulaiJual}
                onChange={setTanggalMulaiJual}
                optional
              />
              <DateTimePickerField
                label="Penutupan Pendaftaran"
                value={tanggalTutupDaftar}
                onChange={setTanggalTutupDaftar}
                optional
              />
            </div>

            {/* Max Peserta */}
            <div className="space-y-2">
              <Label>Jumlah Maksimum Peserta <span className="text-gray-400 font-normal">(opsional)</span></Label>
              <div className="flex items-center bg-[#eaedf0] rounded-lg h-10 w-full overflow-hidden px-1">
                <button
                  type="button"
                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-slate-200 text-slate-600 transition"
                  onClick={() => {
                    const current = parseInt(formData.max_peserta) || 0;
                    if (current > 0) {
                      setFormData({
                        ...formData,
                        max_peserta: String(current - 1),
                      });
                    }
                  }}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  placeholder="Kosongkan untuk unlimited"
                  className="flex-1 bg-transparent text-center text-sm border-0 focus:ring-0 focus:outline-none text-slate-800 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:margin-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:margin-0 [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.max_peserta}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      max_peserta: val,
                    });
                  }}
                />
                <button
                  type="button"
                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-slate-200 text-slate-600 transition"
                  onClick={() => {
                    const current = parseInt(formData.max_peserta) || 0;
                    setFormData({
                      ...formData,
                      max_peserta: String(current + 1),
                    });
                  }}
                >
                  <span className="text-lg font-medium leading-none">+</span>
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Pendaftaran akan ditutup otomatis setelah batas peserta tercapai.
              </p>
            </div>

            {/* Instruksi */}
            <div className="space-y-2">
              <Label>Instruksi Setelah Daftar</Label>
              <p className="text-xs text-gray-500 leading-relaxed">
                Catatan yang akan dilihat pendaftar setelah membayar. Bisa berisi link zoom, password, grup WA, dsb.
              </p>
              <Textarea
                placeholder="Contoh: Silakan bergabung ke grup WhatsApp melalui link berikut..."
                rows={3}
                value={formData.instruksi}
                onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
              />
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-2">
              <Label>Syarat & Ketentuan</Label>
              <Textarea
                placeholder="Tuliskan syarat dan ketentuan webinar..."
                rows={3}
                value={formData.syarat_ketentuan}
                onChange={(e) => setFormData({ ...formData, syarat_ketentuan: e.target.value })}
              />
            </div>

            {/* Redirect URL */}
            <div className="space-y-2">
              <Label>
                Redirect URL <span className="text-gray-400 font-normal">(opsional)</span>
              </Label>
              <Input
                type="url"
                placeholder="https://example.com/thank-you"
                value={formData.redirect_url}
                onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Pelanggan akan dibawa ke halaman ini setelah membayar.
              </p>
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