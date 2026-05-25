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
import { Calendar } from "@/components/ui/calendar";
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
};

type IndexProps = {
  links: PaymentLinkItem[];
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
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
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
  harga: "",
  harga_coret: "",
  deskripsi: "",
  pesan_setelah_bayar: "",
  maksimum_pembayaran: "",
  redirect_url: "",
  bisa_affiliate: false,
};

// ─── Helper: format rupiah ───
function formatRupiah(val: string | number): string {
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
}

// ─── Main ───
export default function Index({ links }: IndexProps) {
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
    return matchStatus && matchSearch;
  });

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

  const filterButtons = [
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
    if (tanggalKadaluarsa) payload.append("tanggal_kadaluarsa", format(tanggalKadaluarsa, "yyyy-MM-dd"));
    if (coverFile) payload.append("cover", coverFile);

    router.post("/payment-link", payload, {
      forceFormData: true,
      onSuccess: () => {
        setCreateOpen(false);
        setIsSubmitting(false);
      },
      onError: () => setIsSubmitting(false),
    });
  };

  return (
    <DashboardLayout title="Link Pembayaran">
      <Head title="Link Pembayaran" />
      <div className="flex gap-0 min-h-screen">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Link Pembayaran</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/payment-link/catalog", "_blank")}
              >
                PRODUK
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={openCreate}>
                + BUAT
              </Button>
            </div>
          </div>

          {/* Table Panel */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Link Pembayaran</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Filter Halaman"
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Printer className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {filteredLinks.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">
                  There are no records to display
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-50 rounded-lg p-2 mt-0.5">
                          <Link2 className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{link.nama}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <Tag className="h-3 w-3" />
                              Rp {formatRupiah(link.harga)}
                            </span>
                            {link.harga_coret && (
                              <span className="line-through text-gray-400 text-xs">
                                Rp {formatRupiah(link.harga_coret)}
                              </span>
                            )}
                            {link.tanggal_kadaluarsa && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Exp: {link.tanggal_kadaluarsa}
                              </span>
                            )}
                            {link.maksimum_pembayaran && (
                              <span>Kuota: {link.maksimum_pembayaran}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(link.status)}
                        <Button size="sm" onClick={() => router.visit(`/payment-link/${link.id}`)}>
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left text-gray-500 hover:border-gray-300 transition",
                  dateFilter && "text-gray-800"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
                {dateFilter ? format(dateFilter, "dd MMM yyyy") : "Filter Berdasarkan Tanggal..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={(date) => { setDateFilter(date); setDateOpen(false); }}
                initialFocus
              />
              {dateFilter && (
                <div className="p-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-gray-500"
                    onClick={() => { setDateFilter(undefined); setDateOpen(false); }}>
                    Reset Tanggal
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Cari Link Pembayaran"
            className="bg-white text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={cn(
                  "w-full px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide transition",
                  statusFilter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.open("/payment-link/catalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG LINK PEMBAYARAN
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog adalah halaman online dimana semua link pembayaran anda yang aktif ditampilkan.
          </p>

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Link Pembayaran
          </button>
        </div>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Link Pembayaran
              </DialogTitle>
            </div>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Terima pembayaran dengan mudah dari banyak orang dengan jumlah pembayaran yang sama.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Nama */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
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
              <Label className="text-sm font-medium text-gray-700">
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
              <Label className="text-sm font-medium text-gray-700">
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
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Cover (gambar/video untuk promo)
              </Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">Drag &amp; drop image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP, MP4 (maks. 10MB)</p>
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
              <Label className="text-sm font-medium text-gray-700">
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
              <Label className="text-sm font-medium text-gray-700">
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
              <Label className="text-sm font-medium text-gray-700">
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
              <Label className="text-sm font-medium text-gray-700">
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
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Buat Link Pembayaran"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
