import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarIcon,
  Printer,
  Download,
  ExternalLink,
  Upload,
  Link2,
  Clock,
  Tag,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───
export type PaymentLinkItem = {
  id: number;
  nama: string;
  harga: number;
  harga_coret?: number;
  status: "published" | "unpublished" | "unlisted";
  slug: string;
  cover_url?: string;
  created_at: string;
  tanggal_kadaluarsa?: string;
  maksimum_pembayaran?: number;
  bisa_affiliate: boolean;
  revenue?: number;
};

type IndexProps = {
  links: PaymentLinkItem[];
  totalRevenue?: number;
  revenueGrowthText?: string;
};

// ─── DatePickerField ───
function DatePickerField({
  label,
  value,
  onChange,
  optional = false,
  withTime = false,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  optional?: boolean;
  withTime?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(() => {
    if (value) {
      const h = String(value.getHours()).padStart(2, '0');
      const m = String(value.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    return "00:00";
  });

  useEffect(() => {
    if (value) {
      const h = String(value.getHours()).padStart(2, '0');
      const m = String(value.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    }
  }, [value]);

  const handleSelect = (d: Date | undefined) => {
    if (!d) {
      onChange(undefined);
      return;
    }
    if (withTime) {
      const [h, m] = time.split(":").map(Number);
      const combined = new Date(d);
      combined.setHours(h, m, 0, 0);
      onChange(combined);
    } else {
      onChange(d);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (value) {
      const [h, m] = newTime.split(":").map(Number);
      const updated = new Date(value);
      updated.setHours(h, m, 0, 0);
      onChange(updated);
    }
  };

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
              ? format(value, withTime ? "dd MMMM yyyy HH:mm" : "dd MMMM yyyy", { locale: idLocale })
              : "Pilih tanggal..."}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[200]" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
          />
          {withTime && (
            <div className="p-3 border-t flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="text-sm border border-gray-200 rounded px-2 py-1 flex-1 font-medium bg-white"
              />
            </div>
          )}
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
  harga: "",
  harga_coret: "",
  deskripsi: "",
  pesan_setelah_bayar: "",
  maksimum_pembayaran: "",
  redirect_url: "",
  bisa_affiliate: false,
};

function formatRupiah(val: string | number): string {
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
}

// ─── Main ───
export default function Index({ links, totalRevenue, revenueGrowthText }: IndexProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ ...defaultForm });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [waktuMulaiJual, setWaktuMulaiJual] = useState<Date | undefined>();
  const [tanggalKadaluarsa, setTanggalKadaluarsa] = useState<Date | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setFormData({ ...defaultForm });
    setCoverFile(null);
    setCoverPreview(null);
    setWaktuMulaiJual(undefined);
    setTanggalKadaluarsa(undefined);
    setCreateOpen(true);
  };

  const filteredLinks = links.filter((l) => {
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchSearch = l.nama.toLowerCase().includes(search.toLowerCase());
    let matchDate = true;
    if (dateFilter) {
      const formattedFilterDate = format(dateFilter, "yyyy-MM-dd");
      matchDate = l.created_at ? l.created_at.startsWith(formattedFilterDate) : false;
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

  const handleHargaChange = (field: "harga" | "harga_coret", val: string) => {
    const clean = val.replace(/\D/g, "");
    setFormData({ ...formData, [field]: clean });
  };

  const handleSubmit = () => {
    if (!formData.nama.trim()) return alert("Nama link pembayaran tidak boleh kosong");
    if (!formData.harga) return alert("Harga harus diisi");
    if (!formData.deskripsi.trim()) return alert("Deskripsi tidak boleh kosong");
    if (
      formData.harga_coret &&
      parseInt(formData.harga_coret) <= parseInt(formData.harga)
    )
      return alert("Harga coret harus lebih besar dari harga utama");

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("nama", formData.nama);
    payload.append("harga", formData.harga);
    payload.append("deskripsi", formData.deskripsi);
    if (formData.harga_coret) payload.append("harga_coret", formData.harga_coret);
    if (formData.pesan_setelah_bayar) payload.append("pesan_setelah_bayar", formData.pesan_setelah_bayar);
    if (formData.maksimum_pembayaran) payload.append("maksimum_pembayaran", formData.maksimum_pembayaran);
    if (formData.redirect_url) payload.append("redirect_url", formData.redirect_url);
    payload.append("bisa_affiliate", formData.bisa_affiliate ? "1" : "0");
    if (waktuMulaiJual) payload.append("waktu_mulai_jual", format(waktuMulaiJual, "yyyy-MM-dd HH:mm:ss"));
    if (tanggalKadaluarsa) payload.append("tanggal_kadaluarsa", format(tanggalKadaluarsa, "yyyy-MM-dd HH:mm:ss"));
    if (coverFile) payload.append("cover", coverFile);

    router.post("/payment-link", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
        router.reload();
      },
      onError: () => setIsSubmitting(false),
    });
  };

  const totalLinks = links.length;
  const aktifCount = links.filter((l) => l.status === "published").length;
  const unlistedCount = links.filter((l) => l.status === "unlisted").length;
  const tidakAktifCount = totalLinks - aktifCount - unlistedCount;
  const localPendapatan = links.reduce((acc, l) => acc + (l.revenue || 0), 0);
  const displayRevenue = totalRevenue !== undefined ? totalRevenue : localPendapatan;
  const growthText = revenueGrowthText || "+0% Dari bulan kemarin";

  return (
    <DashboardLayout title="Link Pembayaran">
      <Head title="Link Pembayaran" />
      <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Link Pembayaran</h1>
            <div className="flex flex-col gap-2 mt-3">
              {/* Baris 1: Status Produk */}
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium flex-wrap">
                <span>Total Link: <span className="font-bold text-slate-800">{totalLinks}</span></span>
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
              onClick={() => window.open("/payment-link/catalog", "_blank")}
            >
              Katalog Publik
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
              onClick={openCreate}
            >
              + Buat Link Pembayaran
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
              placeholder="Cari Nama Link..."
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
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Link</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Harga</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-slate-200">
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-slate-400 py-16 text-sm">
                      There are no records to display
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((l, index) => {
                    const statusIsPublik = l.status === "published";
                    const formattedDate = l.created_at ? format(new Date(l.created_at), "dd MMM yyyy", { locale: idLocale }) : "-";
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-5 py-5 text-sm text-slate-550 font-semibold">{index + 1}</td>
                        <td className="px-5 py-5">
                          {l.cover_url ? (
                            <img
                              src={l.cover_url}
                              alt={l.nama}
                              className="h-10 w-14 object-cover rounded-lg border border-slate-100 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-14 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                              <Package className="h-5 w-5 text-slate-455" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 text-sm font-bold text-slate-800 select-all max-w-[250px] truncate">
                          {l.nama}
                        </td>
                        <td className="px-5 py-5 text-sm text-slate-655 font-semibold whitespace-nowrap">
                          Rp {formatRupiah(l.harga)}
                          {l.harga_coret && (
                            <span className="ml-2 text-xs line-through text-slate-400">
                              Rp {formatRupiah(l.harga_coret)}
                            </span>
                          )}
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
                            onClick={() => router.visit(`/payment-link/${l.id}`)}
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
              Buat Link Pembayaran
            </DialogTitle>
          </div>

          <div className="p-6 space-y-5">
            {/* Nama */}
            <div className="space-y-1">
              <Label>
                Nama Link Pembayaran <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Pembayaran Seminar UI/UX 2025"
                maxLength={150}
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
              <p className="text-xs text-gray-400 text-right">{formData.nama.length}/150</p>
            </div>

            {/* Harga */}
            <div className="space-y-1">
              <Label>
                Harga <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-gray-500 font-medium">Rp</span>
                <Input
                  className="pl-9"
                  placeholder="0"
                  value={formData.harga ? formatRupiah(formData.harga) : ""}
                  onChange={(e) => handleHargaChange("harga", e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <p className="text-xs text-gray-400">
                Penagihan ini menggunakan mata uang IDR (Rupiah)
              </p>
            </div>

            {/* Harga Coret */}
            <div className="space-y-1">
              <Label>
                Harga Coret{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-gray-500 font-medium">Rp</span>
                <Input
                  className="pl-9"
                  placeholder="0"
                  value={formData.harga_coret ? formatRupiah(formData.harga_coret) : ""}
                  onChange={(e) => handleHargaChange("harga_coret", e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <p className="text-xs text-gray-400">
                Harga coret harus lebih besar dari harga utama.
              </p>
            </div>

            {/* Cover */}
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

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label>
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Tuliskan deskripsi link pembayaran kamu..."
                rows={4}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            {/* Waktu Mulai Jual & Kadaluarsa */}
            <div className="grid grid-cols-2 gap-4">
              <DatePickerField
                label="Waktu Mulai Penjualan"
                value={waktuMulaiJual}
                onChange={setWaktuMulaiJual}
                optional
                withTime
              />
              <DatePickerField
                label="Tanggal Kadaluarsa"
                value={tanggalKadaluarsa}
                onChange={setTanggalKadaluarsa}
                optional
                withTime
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                Kami akan membuka link pembayaran pada tanggal dan waktu yang anda pilih. Opsional,
                kosongkan untuk langsung membuka penjualan.
              </p>
              <p className="text-xs text-gray-400">
                Kami akan menutup link pembayaran pada tanggal kadaluarsa (opsional).
              </p>
            </div>

            {/* Pesan setelah bayar */}
            <div className="space-y-1">
              <Label>
                Pesan setelah bayar / catatan
              </Label>
              <Textarea
                placeholder="Contoh: Terima kasih telah melakukan pembayaran! Silakan bergabung ke grup WhatsApp: https://..."
                rows={3}
                maxLength={2000}
                value={formData.pesan_setelah_bayar}
                onChange={(e) => setFormData({ ...formData, pesan_setelah_bayar: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Pesan yang akan dilihat oleh pendaftar/pembeli setelah melakukan pembayaran (opsional).
              </p>
              <p className="text-xs text-gray-400 text-right">{formData.pesan_setelah_bayar.length}/2000</p>
            </div>

            {/* Maksimum Pembayaran */}
            <div className="space-y-1">
              <Label>
                Maksimum Jumlah Pembayaran (Kuota / Qty){" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                type="number"
                min={1}
                placeholder="Kosongkan untuk unlimited"
                value={formData.maksimum_pembayaran}
                onChange={(e) => setFormData({ ...formData, maksimum_pembayaran: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Kami akan menutup link pembayaran setelah melewati batas jumlah maksimal. Kosongkan untuk tanpa limit (unlimited).
              </p>
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label>
                Redirect URL{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </Label>
              <Input
                type="url"
                placeholder="https://websitesaya.com/pembayaran-sukses"
                value={formData.redirect_url}
                onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Jika diisi, Kami akan membawa pelanggan ke halaman ini setelah sukses membayar.
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
