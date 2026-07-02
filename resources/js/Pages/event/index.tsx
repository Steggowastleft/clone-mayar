import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPicker } from "@/components/ui/mappicker";
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
  CalendarDays,
  MapPin,
  Clock,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Event = {
  id: number;
  name: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  location: string;
  participants: number;
  revenue?: number;
  tipe: "online" | "offline";
  cover_url?: string | null;
  created_at?: string | null;
};

type IndexProps = {
  events: Event[];
  totalRevenue?: number;
  revenueGrowthText?: string;
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
  return (
    <div className="space-y-1">
      <Label>
        {label}{" "}
        {optional && (
          <span className="text-gray-400 font-normal">(Opsional)</span>
        )}
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
            onSelect={(d) => {
              onChange(d);
              setOpen(false);
            }}
            initialFocus
          />
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
  nama: "",
  deskripsi: "",
  tipe: "online" as "online" | "offline",
  lokasi: "",
  lokasiMap: "",
  linkMeeting: "",
  instruksi: "",
  syaratKetentuan: "",
  maxTiketPerTransaksi: "1",
  redirectUrl: "",
};

// ─── Main ───
export default function Index({ events, totalRevenue, revenueGrowthText }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipeFilter, setTipeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [waktuMulai, setWaktuMulai] = useState<Date | undefined>();
  const [waktuSelesai, setWaktuSelesai] = useState<Date | undefined>();
  const [waktuMulaiJual, setWaktuMulaiJual] = useState<Date | undefined>();
  const [tanggalTutupDaftar, setTanggalTutupDaftar] = useState<
    Date | undefined
  >();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setWaktuMulai(undefined);
    setWaktuSelesai(undefined);
    setWaktuMulaiJual(undefined);
    setTanggalTutupDaftar(undefined);
    setCreateOpen(true);
  };

  const filteredEvents = events.filter((e) => {
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchTipe = tipeFilter === "all" || e.tipe === tipeFilter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
    let matchDate = true;
    if (dateFilter) {
      const formattedFilterDate = format(dateFilter, "yyyy-MM-dd");
      matchDate = e.created_at ? e.created_at.startsWith(formattedFilterDate) : false;
    }
    return matchStatus && matchTipe && matchSearch && matchDate;
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
    if (!formData.nama.trim()) {
      toast.error("Nama event tidak boleh kosong");
      return;
    }
    if (!formData.deskripsi.trim()) {
      toast.error("Deskripsi tidak boleh kosong");
      return;
    }
    if (!waktuMulai) {
      toast.error("Waktu mulai harus diisi");
      return;
    }
    if (formData.tipe === "online" && !formData.linkMeeting.trim()) {
      toast.error("Link meeting harus diisi untuk event online");
      return;
    }
    if (formData.tipe === "offline" && !formData.lokasi.trim()) {
      toast.error("Lokasi harus diisi untuk event offline");
      return;
    }
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("tipe", formData.tipe);
    if (formData.tipe === "offline") {
      payload.append("lokasi", formData.lokasi);
      if (formData.lokasiMap) payload.append("lokasi_map", formData.lokasiMap);
    }
    if (formData.tipe === "online" && formData.linkMeeting) {
      payload.append("redirect_url", formData.linkMeeting);
    }
    payload.append("instruksi", formData.instruksi);
    payload.append("syarat_ketentuan", formData.syaratKetentuan);
    payload.append(
      "max_tiket_per_transaksi",
      formData.maxTiketPerTransaksi
    );
    if (waktuMulai)
      payload.append(
        "waktu_mulai",
        format(waktuMulai, "yyyy-MM-dd HH:mm:ss")
      );
    if (waktuSelesai)
      payload.append(
        "waktu_selesai",
        format(waktuSelesai, "yyyy-MM-dd HH:mm:ss")
      );
    if (waktuMulaiJual)
      payload.append(
        "waktu_mulai_jual",
        format(waktuMulaiJual, "yyyy-MM-dd HH:mm:ss")
      );
    if (tanggalTutupDaftar)
      payload.append(
        "tanggal_tutup_daftar",
        format(tanggalTutupDaftar, "yyyy-MM-dd")
      );
    if (coverFile) payload.append("cover", coverFile);

    router.post("/event", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
        toast.success("Event berhasil dibuat!");
        router.reload();
      },
      onError: (errors) => {
        setIsSubmitting(false);
        const errorMsg = Object.values(errors)[0] as string || "Terjadi kesalahan saat membuat event";
        toast.error(errorMsg);
      },
    });
  };

  const tiketOptions = Array.from({ length: 50 }, (_, i) => i + 1);

  const totalEvents = events.length;
  const aktifCount = events.filter((e) => e.status === "published").length;
  const unlistedCount = events.filter((e) => e.status === "unlisted").length;
  const tidakAktifCount = totalEvents - aktifCount - unlistedCount;
  const localPendapatan = events.reduce((acc, e) => acc + (e.revenue || 0), 0);
  const displayRevenue = totalRevenue !== undefined ? totalRevenue : localPendapatan;
  const growthText = revenueGrowthText || "+0% Dari bulan kemarin";

  return (
    <DashboardLayout title="Event & Acara">
      <Head title="Event & Acara" />
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Event & Acara</h1>
            <div className="flex flex-col gap-2 mt-3">
              {/* Baris 1: Status Produk */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Event: <span className="font-bold text-slate-800">{totalEvents}</span></span>
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
              onClick={() => window.open("/event/catalog", "_blank")}
            >
              Katalog Publik
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={openCreate}
            >
              + Buat Event
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
              placeholder="Cari Nama Event..."
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
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Event</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lokasi / Link</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peserta</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e, index) => {
                    const statusIsPublik = e.status === "published";
                    const formattedDate = e.created_at ? format(new Date(e.created_at), "dd MMM yyyy", { locale: idLocale }) : "-";
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {e.cover_url ? (
                            <img
                              src={e.cover_url}
                              alt={e.name}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-slate-655 capitalize">
                          {e.tipe}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[200px] truncate">
                          {e.name}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-655 font-semibold select-all max-w-[180px] truncate">
                          {e.location || "-"}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{e.participants}</td>
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
                            onClick={() => router.visit(`/event/${e.id}`)}
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
              Buat Event / Acara
            </DialogTitle>
          </div>

          <div className="p-6 space-y-5">
            {/* Nama Event */}
            <div className="space-y-1">
              <Label>
                Nama Event / Acara{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Tech Conference 2025"
                maxLength={100}
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.nama.length}/100
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label>
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Tuliskan deskripsi event kamu..."
                rows={4}
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deskripsi: e.target.value,
                  })
                }
              />
            </div>

            {/* Tipe Event - Dropdown */}
            <div className="space-y-1">
              <Label>
                Tipe Event <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipe}
                onValueChange={(value: "online" | "offline") =>
                  setFormData({ ...formData, tipe: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online (Virtual Meeting)</SelectItem>
                  <SelectItem value="offline">Offline (On-site / Venue)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Link Meeting - Only for Online */}
            {formData.tipe === "online" && (
              <div className="space-y-1">
                <Label>
                  Link Meeting / Join URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://zoom.us/j/xxxxxx atau https://meet.google.com/xxx-xxxx-xxx"
                  value={formData.linkMeeting}
                  onChange={(e) =>
                    setFormData({ ...formData, linkMeeting: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400">
                  Link untuk peserta bergabung ke event online (Zoom, Google Meet, dll)
                </p>
              </div>
            )}

            {/* Lokasi - Only for Offline */}
            {formData.tipe === "offline" && (
              <MapPicker
                address={formData.lokasi}
                mapUrl={formData.lokasiMap}
                onAddressChange={(address) =>
                  setFormData({ ...formData, lokasi: address })
                }
                onMapUrlChange={(url) =>
                  setFormData({ ...formData, lokasiMap: url })
                }
                label="Lokasi / Alamat Venue *"
              />
            )}

            {/* Waktu */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Waktu Mulai"
                value={waktuMulai}
                onChange={setWaktuMulai}
              />
              <DateTimePickerField
                label="Waktu Selesai"
                value={waktuSelesai}
                onChange={setWaktuSelesai}
                optional
              />
            </div>
            <p className="text-xs text-gray-400">
              Timezone menggunakan WIB (GMT+07:00) - Asia/Jakarta
            </p>

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
                accept="image/*,video/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverFile && <p className="text-xs text-green-600">✓ {coverFile.name}</p>}
            </div>

            {/* Instruksi */}
            <div className="space-y-1">
              <Label>
                Instruksi
              </Label>
              <p className="text-xs text-gray-500">
                Instruksi setelah pendaftaran / pembayaran
              </p>
              <Textarea
                placeholder="Contoh: Silakan bergabung ke grup WhatsApp melalui link berikut..."
                rows={3}
                maxLength={500}
                value={formData.instruksi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instruksi: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.instruksi.length}/500
              </p>
            </div>

            {/* Syarat & Ketentuan */}
            <div className="space-y-1">
              <Label>
                Syarat dan Ketentuan
              </Label>
              <Textarea
                placeholder="Tuliskan syarat dan ketentuan event..."
                rows={4}
                maxLength={1000}
                value={formData.syaratKetentuan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    syaratKetentuan: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-400 text-right">
                {formData.syaratKetentuan.length}/1000
              </p>
              <p className="text-xs text-gray-400">
                1 akun email - 1 kali transaksi
              </p>
            </div>

            {/* Tanggal Jual & Tutup */}
            <div className="grid grid-cols-2 gap-4">
              <DateTimePickerField
                label="Waktu Mulai Penjualan"
                value={waktuMulaiJual}
                onChange={setWaktuMulaiJual}
                optional
              />
              <DateTimePickerField
                label="Tanggal Pendaftaran Ditutup"
                value={tanggalTutupDaftar}
                onChange={setTanggalTutupDaftar}
                optional
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                Kami akan membuka link pembayaran pada tanggal dan
                waktu yang anda pilih. Opsional, kosongkan untuk
                langsung membuka penjualan.
              </p>
              <p className="text-xs text-gray-400">
                Kami akan menutup pendaftaran pada tanggal ini
                (opsional), jika tidak diisi kami akan menutup event
                ini setelah acara dimulai.
              </p>
            </div>

            {/* Max Tiket per Transaksi */}
            <div className="space-y-1">
              <Label>
                Jumlah maksimal tiket per transaksi
              </Label>
              <Select
                value={formData.maxTiketPerTransaksi}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    maxTiketPerTransaksi: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200] max-h-60">
                  {tiketOptions.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} Tiket
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label>
                Redirect URL{" "}
                <span className="text-gray-400 font-normal">
                  (Opsional)
                </span>
              </Label>
              <Input
                type="url"
                placeholder="https://example.com/thank-you"
                value={formData.redirectUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    redirectUrl: e.target.value,
                  })
                }
              />
              <p className="text-xs text-gray-400">
                Pelanggan akan dibawa ke halaman ini setelah membayar
                (opsional / bisa dikosongkan).
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