import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { router } from "@inertiajs/react";
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
    return matchStatus && matchSearch;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "unpublished": return <Badge className="bg-yellow-500 text-white">Unpublished</Badge>;
      case "unlisted": return <Badge className="bg-gray-500 text-white">Unlisted</Badge>;
      default: return <Badge>Unknown</Badge>;
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

  const [pricingType, setPricingType] = useState<"free" | "paid" | "donation">("free")

  return (
    <DashboardLayout title="Webinar">
      <div className="flex gap-0 min-h-screen">

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Webinar</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => window.open("/webinars/catalog", "_blank")}
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
              <h2 className="font-semibold text-gray-700">Semua Webinar</h2>
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
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-6">
              {filteredWebinars.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">There are no records to display</p>
              ) : (
                <div className="space-y-3">
                  {filteredWebinars.map((webinar) => (
                    <div
                      key={webinar.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{webinar.nama}</p>
                        <p className="text-sm text-gray-500">
                          {webinar.tanggal_mulai
                            ? format(new Date(webinar.tanggal_mulai), "dd MMM yyyy HH:mm", { locale: idLocale })
                            : "Tanggal belum diset"}
                          {" · "}
                          {webinar.peserta} peserta
                          {webinar.max_peserta ? ` / ${webinar.max_peserta}` : ""}
                          {" · "}
                          {webinar.harga === 0
                            ? "Gratis"
                            : `Rp ${webinar.harga.toLocaleString("id-ID")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(webinar.status)}
                        <Button size="sm" onClick={() => router.visit(`/webinars/${webinar.id}`)}>
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

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left text-gray-500 hover:border-gray-300 transition",
                dateFilter && "text-gray-800"
              )}>
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
                  <Button
                    variant="ghost" size="sm"
                    className="w-full text-xs text-gray-500"
                    onClick={() => { setDateFilter(undefined); setDateOpen(false); }}
                  >
                    Reset Tanggal
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Input
            placeholder="Cari Webinar"
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
            onClick={() => window.open("/webinars/catalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2"
          >
            KATALOG WEBINAR
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Katalog Webinar adalah halaman katalog online dimana semua Webinar anda yang aktif ditampilkan.
          </p>

          <button className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition bg-white">
            INFO & TUTORIAL
          </button>

          <button
            onClick={openCreate}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition"
          >
            + Buat Webinar Baru
          </button>
        </div>
      </div>

      {/* ── CREATE DIALOG ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <Video className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-white text-xl font-bold">
                Buat Webinar Baru
              </DialogTitle>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Buat dan kelola webinar online Anda dengan mudah
            </p>
          </div>

          <div className="p-6 space-y-5">

            {/* Nama */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
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
              <Label className="text-sm font-medium text-gray-700">
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
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => setFormData({ ...formData, timezone: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih timezone..." />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  {timezoneOptions.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Tipe Harga</Label>
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
                  <Label className="text-sm font-medium text-gray-700">Harga (Rp)</Label>
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
                  <Label className="text-sm font-medium text-gray-700">
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
                <Label className="text-sm font-medium text-gray-700">
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
              <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
              <Textarea
                placeholder="Tuliskan deskripsi webinar kamu..."
                rows={4}
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            {/* Cover */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Cover Gambar</Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-500">Klik untuk unggah gambar cover</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP (maks. 5MB)</p>
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
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Jumlah Maksimum Peserta</Label>
              <Input
                type="number"
                placeholder="Kosongkan untuk unlimited"
                min={1}
                value={formData.max_peserta}
                onChange={(e) => setFormData({ ...formData, max_peserta: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Pendaftaran akan ditutup otomatis setelah batas peserta tercapai.
              </p>
            </div>

            {/* Instruksi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Instruksi Setelah Daftar</Label>
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
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Syarat & Ketentuan</Label>
              <Textarea
                placeholder="Tuliskan syarat dan ketentuan webinar..."
                rows={3}
                value={formData.syarat_ketentuan}
                onChange={(e) => setFormData({ ...formData, syarat_ketentuan: e.target.value })}
              />
            </div>

            {/* Redirect URL */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Redirect URL <span className="text-gray-400 font-normal">(Opsional)</span>
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
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCreateOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Buat Webinar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}